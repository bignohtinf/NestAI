from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import json
import logging
import os
import re
import asyncio
import time

logger = logging.getLogger(__name__)

# ─── In-memory cache cho AI Insights ────────────────────────────────────
# Tránh gọi OpenAI mỗi lần user mở trang nutrition-report.
# Cache theo user_id, TTL 6 giờ, invalidate khi có bữa ăn mới.
_INSIGHTS_CACHE_TTL = 6 * 3600  # 6 giờ

# Structure: { user_id: { "data": {...summary response}, "ts": timestamp, "log_count": int } }
_summary_cache: dict[str, dict] = {}


def _get_cached_summary(user_id: str) -> dict | None:
    """Trả về cached summary nếu còn hạn, None nếu hết hạn hoặc chưa có."""
    entry = _summary_cache.get(user_id)
    if not entry:
        return None
    if time.time() - entry["ts"] > _INSIGHTS_CACHE_TTL:
        _summary_cache.pop(user_id, None)
        return None
    return entry["data"]


def _set_cached_summary(user_id: str, data: dict, log_count: int) -> None:
    """Lưu summary vào cache."""
    _summary_cache[user_id] = {
        "data": data,
        "ts": time.time(),
        "log_count": log_count,
    }


def invalidate_nutrition_cache(user_id: str) -> None:
    """Xóa cache khi user ghi nhận bữa ăn mới."""
    removed = _summary_cache.pop(user_id, None)
    if removed:
        logger.info(f"Nutrition cache invalidated for user {user_id}")

router = APIRouter()

class ScanFoodNotifyRequest(BaseModel):
    mother_id: Optional[str] = None   # backward compat — dùng khi mẹ scan
    user_id: Optional[str] = None     # generic — dùng cho cả mẹ lẫn bố
    meal_data: Dict[str, Any]

class NutritionLogCreate(BaseModel):
    meal_name: str
    calories: float
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    meal_type: Optional[str] = None   # breakfast | lunch | dinner | snack
    source: Optional[str] = None      # manual | ai_recommendation | smart_scan

class PhotoAnalysisRequest(BaseModel):
    image: str
    user_id: Optional[str] = None

class DishAnalysis(BaseModel):
    """Individual dish analysis result."""
    name: str
    confidence: float
    estimated_grams: float
    matched_food: Optional[dict]
    match_score: float
    calories: float
    protein: float
    carbs: float
    fat: float
    iron: Optional[float] = None
    calcium: Optional[float] = None
    pregnancy_benefit: str
    portion_multiplier: float = 1.0

class PhotoAnalysisResponse(BaseModel):
    """Multi-dish photo analysis response."""
    dishes: List[DishAnalysis]
    meal_context: Optional[str]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    suggestions: List[str]
    pregnancy_guidance: Optional[str] = None

SYSTEM_PROMPT = """Bạn là chuyên gia dinh dưỡng và nhận diện món ăn Việt Nam.

Nhiệm vụ: Phân tích ảnh, nhận diện từng món với tên CỤ THỂ NHẤT có thể, và ước tính giá trị dinh dưỡng cho mỗi món.

NGUYÊN TẮC ĐẶT TÊN MÓN (bắt buộc):
1. Tên phải gồm: loại thực phẩm chính + cách chế biến (+ biến thể nếu nhìn thấy rõ).
   Đúng: "thịt lợn ba chỉ rang cháy cạnh", "bún gà xé hành lá", "lòng lợn xào dứa", "canh chua cá lóc"
   Sai: "thịt đỏ rang", "bún nước", "lòng xào", "canh chua"

2. Phân biệt loại thịt dựa vào màu sắc và kết cấu:
   - Thịt hồng nhạt, mỡ trắng xen kẽ → thịt lợn (ba chỉ / nạc / sườn tùy hình dạng)
   - Thịt đỏ đậm, thớ thô → thịt bò
   - Da vàng sậm, thịt tối → vịt
   - Da trắng ngà, thịt nhạt → gà
   - Nếu thực sự không phân biệt được, chọn loại phổ biến nhất trong bữa ăn Việt và đặt confidence thấp (≤ 0.6).

3. Liệt kê TẤT CẢ món trong ảnh: đồ ăn chính, nước chấm, rau ăn kèm, đồ uống.
   Không bỏ sót bất kỳ đĩa/bát/ly nào nhìn thấy rõ.

4. estimated_grams: ước lượng phần ĂN ĐƯỢC trong ảnh (không tính xương, vỏ).

ƯỚC TÍNH DINH DƯỠNG (per 100g, theo cách chế biến Việt Nam điển hình):
- calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g
- iron_per_100g (mg): hàm lượng sắt — dựa trên loại thực phẩm (thịt đỏ 2-4mg, rau xanh đậm 2-6mg, đậu phụ 5mg, gan 6-12mg, cơm trắng 0.2mg)
- calcium_per_100g (mg): hàm lượng canxi — dựa trên loại thực phẩm (sữa 120mg, tôm/cua 80-150mg, rau cải 100-200mg, đậu phụ 350mg, cá nhỏ ăn xương 300-500mg, cơm 10mg)
- Dựa trên nguyên liệu nhìn thấy và phương pháp chế biến.
- Nước chấm / rau: ước lượng theo thành phần điển hình.

Trả về JSON, KHÔNG giải thích thêm:
{
  "dishes": [
    {
      "name": "tên món cụ thể",
      "estimated_grams": 250,
      "confidence": 0.85,
      "calories_per_100g": 180,
      "protein_per_100g": 18.5,
      "carbs_per_100g": 2.0,
      "fat_per_100g": 11.0,
      "iron_per_100g": 2.5,
      "calcium_per_100g": 15.0
    }
  ],
  "meal_context": "bữa sáng/trưa/tối/phụ"
}
"""

OPENAI_MODEL = os.getenv("OPENAI_MODEL_SCAN_FOOD")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

_VISION_MODEL_ALIASES = {
    # Deprecated legacy name frequently used in older configs
    "gpt-4-vision": "gpt-4o",
}


def _resolve_openai_vision_model() -> str:
    configured_model = (OPENAI_MODEL or "").strip()
    if not configured_model:
        return "gpt-4o"
    return _VISION_MODEL_ALIASES.get(configured_model, configured_model)

async def _call_openai_vision(image_data: str) -> dict:
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")
    model_name = _resolve_openai_vision_model()

    max_retries = 3
    retry_delay = 2  # seconds
    timeout = 120.0  # 2 minutes timeout

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {
                                "role": "system",
                                "content": SYSTEM_PROMPT
                            },
                            {
                                "role": "user",
                                "content": [
                                    {"type": "image_url", "image_url": {"url": image_data}}
                                ]
                            }
                        ],
                        "temperature": 0.2,
                        "max_tokens": 1200,
                        # Bắt buộc OpenAI trả JSON hợp lệ — tránh markdown wrapping
                        "response_format": {"type": "json_object"},
                    },
                )

            if response.status_code == 200:
                return response.json()
            
            # Retry on 502, 503, 504 (server errors)
            if response.status_code in [502, 503, 504]:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)  # exponential backoff
                    logger.warning(f"OpenAI API returned {response.status_code}, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                    continue
            
            # For other errors, fail immediately
            if response.status_code == 404 and "model_not_found" in response.text:
                raise HTTPException(
                    status_code=502,
                    detail=(
                        f"OpenAI model '{model_name}' not found or unavailable. "
                        "Set OPENAI_MODEL_SCAN_FOOD to a valid vision model (e.g. gpt-4o)."
                    ),
                )
            raise HTTPException(status_code=502, detail=f"OpenAI error: {response.status_code} {response.text[:500]}")
        
        except asyncio.TimeoutError:
            if attempt < max_retries - 1:
                wait_time = retry_delay * (2 ** attempt)
                logger.warning(f"OpenAI API timeout, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
            raise HTTPException(status_code=504, detail="OpenAI API timeout after multiple retries")

        except HTTPException:
            raise
        except Exception as exc:
            if attempt < max_retries - 1:
                wait_time = retry_delay * (2 ** attempt)
                logger.warning(f"OpenAI API error: {exc}, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
            raise HTTPException(status_code=502, detail=f"Vision model error: {str(exc)}")
    
    raise HTTPException(status_code=502, detail="OpenAI API failed after multiple retries")


def _extract_text_from_openai_response(openai_response: dict) -> str:
    if not isinstance(openai_response, dict):
        return ""

    # OpenAI chat/completions response format
    choices = openai_response.get("choices", [])
    if choices and isinstance(choices, list):
        first_choice = choices[0]
        if isinstance(first_choice, dict):
            message = first_choice.get("message", {})
            if isinstance(message, dict):
                content = message.get("content", "")
                if isinstance(content, str):
                    return content

    return ""


def _parse_json_from_response(text: str) -> dict:
    if not text:
        raise ValueError("Empty response text from OpenAI")

    # 1. Try direct parse (response_format: json_object → should work)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Strip markdown code blocks: ```json ... ``` or ``` ... ```
    stripped = text.strip()
    md_match = re.search(r"```(?:json)?\s*\n?(.*?)```", stripped, re.S)
    if md_match:
        try:
            return json.loads(md_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # 3. Extract first { ... } block (greedy — outermost braces)
    brace_match = re.search(r"\{.*\}", stripped, re.S)
    if brace_match:
        try:
            return json.loads(brace_match.group(0))
        except json.JSONDecodeError:
            pass

    # 4. Nếu vẫn fail, log nội dung để debug
    logger.error(f"Unable to parse JSON from OpenAI response (first 500 chars): {text[:500]}")
    raise ValueError("Unable to parse JSON from OpenAI response")


def _pregnancy_benefit_from_nutrition(protein: float, fat: float, calcium: Optional[float], iron: Optional[float]) -> str:
    """Generate a short pregnancy benefit string from calculated nutrition values."""
    benefits = []
    if protein > 15:
        benefits.append("giàu protein cho sự phát triển của thai nhi")
    if iron is not None and iron > 2.0:
        benefits.append("giàu sắt giúp phòng chống thiếu máu")
    if calcium is not None and calcium > 100:
        benefits.append("giàu canxi hỗ trợ phát triển xương của thai nhi")
    if benefits:
        return "Món ăn này " + ", ".join(benefits) + "."
    return "Món ăn này cung cấp năng lượng và chất dinh dưỡng cần thiết cho mẹ bầu."


def _map_meal_context_to_type(meal_context: str | None) -> str | None:
    """Chuyển meal_context tiếng Việt từ AI → meal_type tiếng Anh cho DB.
    Trả về None nếu không nhận diện được — an toàn cho DB có CHECK constraint.
    """
    if not meal_context:
        return None
    ctx = meal_context.strip().lower()
    mapping = {
        "bữa sáng": "breakfast", "sáng": "breakfast", "breakfast": "breakfast",
        "bữa trưa": "lunch", "trưa": "lunch", "lunch": "lunch",
        "bữa tối": "dinner", "tối": "dinner", "dinner": "dinner",
        "bữa phụ": "snack", "phụ": "snack", "snack": "snack",
    }
    return mapping.get(ctx)


def _pregnancy_guidance_from_totals(total_protein: float, total_calories: float) -> str:
    """Generate overall meal guidance for pregnant women."""
    points = []
    if total_protein > 20:
        points.append("Bữa ăn cung cấp dồi dào protein cho sự phát triển của thai nhi")
    elif total_protein > 10:
        points.append("Bữa ăn cung cấp lượng protein vừa phải")
    else:
        points.append("Mẹ nên bổ sung thêm thực phẩm giàu protein (thịt, cá, trứng) cho bữa ăn tiếp theo")
    if total_calories > 600:
        points.append("bữa ăn đủ năng lượng")
    return ", ".join(points) + "."




@router.post("/analyze-photo", response_model=PhotoAnalysisResponse)
async def analyze_photo(payload: PhotoAnalysisRequest, supabase = Depends(get_supabase)):
    """
    Analyze a meal photo:
    1. OpenAI Vision identifies all dishes with specific names + nutrition estimates per 100g.
    2. Backend calculates actual nutrition from estimated_grams.
    3. Optional DB enrichment: if vector similarity >= 85%, attach canonical DB entry for the dish
       (used for food recommendations — does NOT override AI nutrition values).
    """
    if not payload.image:
        raise HTTPException(status_code=400, detail="Image is required")

    try:
        openai_response = await _call_openai_vision(payload.image)
        raw_text = _extract_text_from_openai_response(openai_response)
        parsed = _parse_json_from_response(raw_text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Vision model error: {str(exc)}")

    dishes = parsed.get("dishes")
    if not dishes or not isinstance(dishes, list) or len(dishes) == 0:
        raise HTTPException(status_code=400, detail="No dishes detected in image")

    logger.info(f"[scan] {len(dishes)} dishes detected")

    meal_context = parsed.get("meal_context")

    dish_analyses: List[DishAnalysis] = []
    total_calories = 0.0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0

    for dish in dishes:
        name = (dish.get("name") or "Không rõ").strip()
        estimated_grams = max(0.0, float(dish.get("estimated_grams") or 0.0))
        confidence = max(0.0, min(1.0, float(dish.get("confidence") or 0.0)))

        # --- Nutrition from AI (per 100g) ---
        cal_100 = max(0.0, float(dish.get("calories_per_100g") or 0.0))
        protein_100 = max(0.0, float(dish.get("protein_per_100g") or 0.0))
        carbs_100 = max(0.0, float(dish.get("carbs_per_100g") or 0.0))
        fat_100 = max(0.0, float(dish.get("fat_per_100g") or 0.0))

        portion = (estimated_grams / 100.0) if estimated_grams > 0 else 1.0
        calories = round(cal_100 * portion, 1)
        protein = round(protein_100 * portion, 1)
        carbs = round(carbs_100 * portion, 1)
        fat = round(fat_100 * portion, 1)

        # --- Vi chất: lấy từ AI estimate (nhanh, không cần vector search) ---
        ai_iron_100 = float(dish.get("iron_per_100g") or 0)
        ai_calcium_100 = float(dish.get("calcium_per_100g") or 0)
        iron: Optional[float] = round(ai_iron_100 * portion, 2) if ai_iron_100 > 0 else None
        calcium: Optional[float] = round(ai_calcium_100 * portion, 2) if ai_calcium_100 > 0 else None

        # DB vector search đã b��� — AI estimate đủ chính xác, tránh lỗi pgvector + chậm
        matched_food = None
        match_score = 0.0

        # --- Pregnancy benefit (based on AI-calculated nutrition + vi chất) ---
        pregnancy_benefit = _pregnancy_benefit_from_nutrition(protein, fat, calcium, iron)

        dish_analyses.append(DishAnalysis(
            name=name,
            confidence=confidence,
            estimated_grams=estimated_grams,
            matched_food=matched_food,
            match_score=round(match_score, 4),
            calories=calories,
            protein=protein,
            carbs=carbs,
            fat=fat,
            iron=iron,
            calcium=calcium,
            pregnancy_benefit=pregnancy_benefit,
            portion_multiplier=round(portion, 2),
        ))

        total_calories += calories
        total_protein += protein
        total_carbs += carbs
        total_fat += fat

    pregnancy_guidance = _pregnancy_guidance_from_totals(total_protein, total_calories)

    return PhotoAnalysisResponse(
        dishes=dish_analyses,
        meal_context=meal_context,
        total_calories=round(total_calories, 1),
        total_protein=round(total_protein, 1),
        total_carbs=round(total_carbs, 1),
        total_fat=round(total_fat, 1),
        suggestions=[],
        pregnancy_guidance=pregnancy_guidance,
    )

@router.get("/logs")
async def get_nutrition_logs(user_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """
    Trả về lịch sử bữa ăn từ 2 nguồn:
    1. nutrition_logs (ghi tay hoặc từ AI recommendation)
    2. food_scan_logs (quét ảnh Smart Scan)
    Merge và sắp xếp theo thời gian, trả về format thống nhất cho frontend.
    """
    combined = []

    # 1. nutrition_logs (loại trừ smart_scan vì đã có trong food_scan_logs)
    nl_res = supabase.table("nutrition_logs") \
        .select("id, user_id, log_date, calories, protein, carbs, fat, notes, meal_type, source, created_at") \
        .eq("user_id", user_id) \
        .neq("source", "smart_scan") \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()

    for log in (nl_res.data or []):
        combined.append({
            "id": log["id"],
            "meal_name": log.get("notes") or log.get("meal_type") or "Bữa ăn",
            "calories": log.get("calories") or 0,
            "protein": log.get("protein") or 0,
            "carbs": log.get("carbs") or 0,
            "fat": log.get("fat") or 0,
            "image_url": None,
            "source": log.get("source", "manual"),
            "meal_type": log.get("meal_type"),
            "created_at": log.get("created_at"),
        })

    # 2. food_scan_logs
    fs_res = supabase.table("food_scan_logs") \
        .select("id, user_id, image_url, recognized_dish_name, nutrition_data, meal_type, created_at") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()

    for scan in (fs_res.data or []):
        nd = scan.get("nutrition_data") or {}
        combined.append({
            "id": scan["id"],
            "meal_name": scan.get("recognized_dish_name") or "Smart Scan",
            # Backward compat: seed data dùng "energy", smart scan dùng "total_calories"
            "calories": nd.get("total_calories") or nd.get("calories") or nd.get("energy") or 0,
            "protein": nd.get("total_protein") or nd.get("protein") or 0,
            "carbs": nd.get("total_carbs") or nd.get("carbs") or nd.get("carbohydrate") or 0,
            "fat": nd.get("total_fat") or nd.get("fat") or 0,
            "image_url": scan.get("image_url"),
            "source": "smart_scan",
            "meal_type": scan.get("meal_type"),
            "created_at": scan.get("created_at"),
        })

    # Sắp xếp theo thời gian mới nhất
    combined.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    return {"logs": combined[:limit]}


@router.post("/logs")
async def create_nutrition_log(user_id: str, log: NutritionLogCreate, supabase = Depends(get_supabase)):
    """Create a nutrition log entry"""
    from datetime import date as _date

    # Validate source nếu có — chỉ chấp nhận giá trị hợp lệ
    valid_sources = {"manual", "ai_recommendation", "smart_scan"}
    source = log.source if log.source in valid_sources else "manual"

    # Validate meal_type nếu có
    valid_meal_types = {"breakfast", "lunch", "dinner", "snack"}
    meal_type = log.meal_type if log.meal_type in valid_meal_types else None

    insert_data: dict = {
        "user_id": user_id,
        "log_date": _date.today().isoformat(),   # bắt buộc NOT NULL
        "calories": round(log.calories),          # round thay vì int() để tránh truncate
        "protein": log.protein,
        "carbs": log.carbs,
        "fat": log.fat,
        "notes": log.notes or log.meal_name,      # notes mô tả bữa, meal_name làm fallback
        "source": source,
    }
    if meal_type:
        insert_data["meal_type"] = meal_type

    result = supabase.table("nutrition_logs").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create nutrition log")

    # Invalidate cache vì có bữa ăn mới
    invalidate_nutrition_cache(user_id)

    return {"status": "created", "data": result.data[0]}


@router.post("/scan-food-notify")
async def scan_food_notify(request: ScanFoodNotifyRequest, supabase = Depends(get_supabase)):
    """Lưu nutrition log + food_scan_log cho BẤT KỲ user nào sau khi smart scan.
    Nếu user là mẹ (có partnership) → gửi thêm notification cho bố.
    Hỗ trợ cả mother_id (backward compat) lẫn user_id (generic).
    """
    from datetime import date as _date, datetime as _dt

    meal_data = request.meal_data
    # Resolve user: ưu tiên user_id, fallback sang mother_id (backward compat)
    scan_user_id = request.user_id or request.mother_id
    if not scan_user_id:
        raise HTTPException(status_code=400, detail="user_id hoặc mother_id là bắt buộc")
    meal_name = meal_data.get("meal_name", "bữa ăn")

    # Map meal_context tiếng Việt → meal_type tiếng Anh (dùng cho cả 2 bảng)
    mapped_meal_type = _map_meal_context_to_type(meal_data.get("meal_context"))

    # 1. Lưu nutrition log (luôn chạy dù có partner hay không)
    try:
        nl_insert: dict = {
            "user_id": scan_user_id,
            "log_date": _date.today().isoformat(),
            "notes": meal_name,
            "calories": round(float(meal_data.get("total_calories") or 0)),
            "protein": float(meal_data.get("total_protein")) if meal_data.get("total_protein") is not None else None,
            "carbs": float(meal_data.get("total_carbs")) if meal_data.get("total_carbs") is not None else None,
            "fat": float(meal_data.get("total_fat")) if meal_data.get("total_fat") is not None else None,
            "source": "smart_scan",
        }
        if mapped_meal_type:
            nl_insert["meal_type"] = mapped_meal_type
        supabase.table("nutrition_logs").insert(nl_insert).execute()
        invalidate_nutrition_cache(scan_user_id)
    except Exception as log_err:
        logger.error(f"scan-food-notify: failed to save nutrition log for user {scan_user_id}: {log_err}", exc_info=True)

    # 1b. Lưu food_scan_logs để summary endpoint có thể đọc iron/calcium
    try:
        dishes = meal_data.get("dishes", [])
        # Tổng hợp vi chất trực tiếp từ dishes — getSummary đọc total_iron/total_calcium
        # thay vì phải loop qua dishes (đơn giản hơn, tránh None handling)
        total_iron = sum(float(d.get("iron") or 0) for d in dishes)
        total_calcium = sum(float(d.get("calcium") or 0) for d in dishes)
        supabase.table("food_scan_logs").insert({
            "user_id": scan_user_id,
            "recognized_dish_name": meal_name,
            "nutrition_data": {
                "total_calories": meal_data.get("total_calories"),
                "total_protein": meal_data.get("total_protein"),
                "total_carbs": meal_data.get("total_carbs"),
                "total_fat": meal_data.get("total_fat"),
                "total_iron": round(total_iron, 2),
                "total_calcium": round(total_calcium, 2),
                "dishes": dishes,
            },
            "meal_type": mapped_meal_type,
        }).execute()
        # Invalidate cache sau khi lưu food_scan_logs (không chỉ nutrition_logs)
        # để summary endpoint trả dữ liệu mới cho cả dashboard mẹ lẫn bố
        invalidate_nutrition_cache(scan_user_id)
    except Exception as fsl_err:
        logger.error(f"scan-food-notify: failed to save food_scan_log for user {scan_user_id}: {fsl_err}", exc_info=True)

    # 2. Tìm partner để gửi notification (chỉ khi user là mẹ trong partnership)
    partnerships = supabase.table("partnerships").select("father_id").eq("mother_id", scan_user_id).eq("status", "accepted").execute()
    if not partnerships.data:
        # Không có partnership hoặc user không phải mẹ → lưu thành công, skip notification
        return {"success": True, "skipped": True, "message": "No partner to notify"}

    partner_id = partnerships.data[0]["father_id"]

    # 3. Lấy tên user (mẹ) để hiển thị trong notification
    user_res = supabase.table("users").select("full_name").eq("id", scan_user_id).execute()
    mother_name = user_res.data[0]["full_name"] if user_res.data else "Mẹ"

    # 4. Insert notification cho bố
    try:
        supabase.table("notifications").insert({
            "user_id": partner_id,
            "type": "scan_food",
            "title": f"🍽️ {mother_name} vừa lưu bữa ăn",
            "message": f"{meal_name} — {meal_data.get('total_calories', 0)} kcal | Protein: {meal_data.get('total_protein', 0)}g | Carbs: {meal_data.get('total_carbs', 0)}g | Béo: {meal_data.get('total_fat', 0)}g",
            "data": {
                **meal_data,
                "mother_name": mother_name,
                "scanned_at": _dt.utcnow().isoformat(),
            }
        }).execute()
    except Exception as notif_err:
        logger.warning(f"scan-food-notify: failed to insert notification: {notif_err}")

    return {"success": True}


@router.get("/summary")
async def get_nutrition_summary(user_id: str, days: int = 7, supabase = Depends(get_supabase)):
    """
    Trả về tổng hợp dinh dưỡng cho NutritionDashboard.
    Có in-memory cache: chỉ gọi OpenAI khi chưa có cache hoặc có bữa ăn mới.
    - summary: avg_calories, total_protein, log_count
    - history: danh sách {date, calories} theo ngày (dùng cho biểu đồ)
    - macro_ratios: tỉ lệ protein/carbs/fat (dùng cho pie chart)
    - micro_nutrients: vi chất thiết yếu (iron, calcium, vitamin_c, zinc) tính từ DB thật
    """
    from datetime import datetime, timedelta
    from collections import defaultdict

    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()

    # Lấy nutrition_logs trong khoảng thời gian
    # Loại trừ source='smart_scan' vì dữ liệu đó đã có trong food_scan_logs
    # → tránh double-count macro (calo, protein, carbs, fat)
    nl_res = supabase.table("nutrition_logs") \
        .select("id, log_date, calories, protein, carbs, fat, source, created_at") \
        .eq("user_id", user_id) \
        .gte("created_at", cutoff) \
        .neq("source", "smart_scan") \
        .order("created_at", desc=True) \
        .execute()

    # Lấy food_scan_logs trong khoảng thời gian
    fs_res = supabase.table("food_scan_logs") \
        .select("nutrition_data, created_at") \
        .eq("user_id", user_id) \
        .gte("created_at", cutoff) \
        .order("created_at", desc=True) \
        .execute()

    # Gộp dữ liệu macro
    all_entries = []
    log_ids = []

    for log in (nl_res.data or []):
        log_ids.append(log["id"])
        all_entries.append({
            "date": log.get("log_date") or (log.get("created_at") or "")[:10],
            "calories": log.get("calories") or 0,
            "protein": log.get("protein") or 0,
            "carbs": log.get("carbs") or 0,
            "fat": log.get("fat") or 0,
        })

    for scan in (fs_res.data or []):
        nd = scan.get("nutrition_data") or {}
        all_entries.append({
            "date": (scan.get("created_at") or "")[:10],
            # Backward compat: seed data dùng "energy", smart scan dùng "total_calories"
            "calories": nd.get("total_calories") or nd.get("calories") or nd.get("energy") or 0,
            "protein": nd.get("total_protein") or nd.get("protein") or 0,
            "carbs": nd.get("total_carbs") or nd.get("carbs") or nd.get("carbohydrate") or 0,
            "fat": nd.get("total_fat") or nd.get("fat") or 0,
        })

    # Aggregate theo ngày cho biểu đồ
    daily = defaultdict(lambda: {"calories": 0, "protein": 0, "carbs": 0, "fat": 0})
    for e in all_entries:
        d = e["date"]
        daily[d]["calories"] += e["calories"]
        daily[d]["protein"] += e["protein"]
        daily[d]["carbs"] += e["carbs"]
        daily[d]["fat"] += e["fat"]

    history = [{"date": d, "calories": round(v["calories"])} for d, v in sorted(daily.items())]

    # Summary
    total_calories = sum(e["calories"] for e in all_entries)
    total_protein = sum(e["protein"] for e in all_entries)
    total_carbs = sum(e["carbs"] for e in all_entries)
    total_fat = sum(e["fat"] for e in all_entries)
    log_count = len(all_entries)
    num_days = max(len(daily), 1)
    avg_calories = round(total_calories / num_days)

    # ─── Cache check ────────────────────────────────────────────────
    # Nếu cache còn hạn VÀ số bữa ăn chưa thay đổi → trả luôn,
    # nhưng cập nhật lại history/summary (dữ liệu nhẹ) để chart luôn mới.
    cached = _get_cached_summary(user_id)
    if cached is not None:
        cache_entry = _summary_cache.get(user_id, {})
        if cache_entry.get("log_count") == log_count:
            # Giữ nguyên ai_insights + nutrition_score từ cache,
            # cập nhật phần dữ liệu realtime (history, summary, macro, micro)
            logger.debug(f"Nutrition cache HIT for user {user_id}")
            # Vẫn cần tính macro/micro cho dữ liệu mới nhất — nhưng skip OpenAI
            pass  # fall through, sẽ dùng cached AI insights bên dưới
        else:
            # log_count thay đổi → invalidate
            invalidate_nutrition_cache(user_id)
            cached = None

    # Macro ratios (% of total grams)
    macro_total = total_protein + total_carbs + total_fat
    if macro_total > 0:
        macro_ratios = [
            {"name": "Protein", "value": round(total_protein / macro_total * 100), "color": "#0075de"},
            {"name": "Carbs", "value": round(total_carbs / macro_total * 100), "color": "#f59e0b"},
            {"name": "Fat", "value": round(total_fat / macro_total * 100), "color": "#10b981"},
        ]
    else:
        macro_ratios = [
            {"name": "Protein", "value": 0, "color": "#0075de"},
            {"name": "Carbs", "value": 0, "color": "#f59e0b"},
            {"name": "Fat", "value": 0, "color": "#10b981"},
        ]

    # ─── Vi chất thiết yếu ───────────────────────────────────────────
    # Tính từ nutrition_log_items → nutrition_database (iron, calcium, vitamin_c, zinc)
    # RDA cho thai phụ (Recommended Daily Allowance):
    #   Sắt: 27mg/ngày, Canxi: 1000mg/ngày, Vitamin C: 85mg/ngày, Kẽm: 11mg/ngày
    RDA = {"iron": 27, "calcium": 1000, "vitamin_c": 85, "zinc": 11}

    total_iron = 0.0
    total_calcium = 0.0
    total_vitamin_c = 0.0
    total_zinc = 0.0

    if log_ids:
        # Lấy nutrition_log_items cho các logs trong khoảng thời gian
        # Join với nutrition_database để lấy vi chất per serving
        try:
            items_res = supabase.table("nutrition_log_items") \
                .select("dish_stt, servings, log_id") \
                .in_("log_id", log_ids) \
                .execute()

            if items_res.data:
                # Lấy tất cả dish_stt unique
                dish_stts = list(set(item["dish_stt"] for item in items_res.data))
                dishes_res = supabase.table("nutrition_database") \
                    .select("stt, iron, calcium, vitamin_c, zinc, serving_size") \
                    .in_("stt", dish_stts) \
                    .execute()

                # Map stt → nutrition
                dish_map = {}
                for d in (dishes_res.data or []):
                    dish_map[d["stt"]] = d

                # Tính tổng vi chất
                for item in items_res.data:
                    dish = dish_map.get(item["dish_stt"])
                    if not dish:
                        continue
                    servings = float(item.get("servings") or 1)
                    total_iron += float(dish.get("iron") or 0) * servings
                    total_calcium += float(dish.get("calcium") or 0) * servings
                    total_vitamin_c += float(dish.get("vitamin_c") or 0) * servings
                    total_zinc += float(dish.get("zinc") or 0) * servings
        except Exception as e:
            logger.warning(f"Failed to fetch micronutrients from nutrition_log_items: {e}")

    # Đọc iron/calcium từ food_scan_logs (Smart Scan)
    # Ưu tiên total_iron/total_calcium (format mới — đã tổng hợp khi save),
    # fallback sang loop dishes (format cũ / backward compat).
    try:
        for scan in (fs_res.data or []):
            nd = scan.get("nutrition_data") or {}
            if nd.get("total_iron") is not None or nd.get("total_calcium") is not None:
                # Format mới: dùng trực tiếp
                total_iron      += float(nd.get("total_iron")    or 0)
                total_calcium   += float(nd.get("total_calcium") or 0)
                total_vitamin_c += float(nd.get("total_vitamin_c") or 0)
                total_zinc      += float(nd.get("total_zinc")    or 0)
            else:
                # Format cũ: loop qua dishes
                for dish in (nd.get("dishes") or []):
                    total_iron      += float(dish.get("iron")      or 0)
                    total_calcium   += float(dish.get("calcium")   or 0)
                    total_vitamin_c += float(dish.get("vitamin_c") or 0)
                    total_zinc      += float(dish.get("zinc")      or 0)
    except Exception as e:
        logger.warning(f"Failed to aggregate micronutrients from food_scan_logs: {e}")

    # Tính % đạt mục tiêu (dựa trên RDA * số ngày có dữ liệu)
    def pct(total: float, rda_per_day: float) -> int:
        target = rda_per_day * num_days
        if target <= 0:
            return 0
        return min(100, round(total / target * 100))

    iron_pct = pct(total_iron, RDA["iron"])
    calcium_pct = pct(total_calcium, RDA["calcium"])
    vitc_pct = pct(total_vitamin_c, RDA["vitamin_c"])
    zinc_pct = pct(total_zinc, RDA["zinc"])

    micro_nutrients = [
        {"name": "Sắt (Iron)", "value": iron_pct, "target": 100, "unit": "mg", "icon": "🩸"},
        {"name": "Canxi (Calcium)", "value": calcium_pct, "target": 100, "unit": "mg", "icon": "🦴"},
        {"name": "Vitamin C", "value": vitc_pct, "target": 100, "unit": "mg", "icon": "🌿"},
        {"name": "Kẽm (Zinc)", "value": zinc_pct, "target": 100, "unit": "mg", "icon": "🧠"},
    ]

    # ─── Điểm Dinh Dưỡng (0-100) ────────────────────────────────────
    # Tính từ 3 yếu tố:
    #   1. Calorie adherence (40%): bám sát mục tiêu 2100 kcal/ngày
    #   2. Macro balance (30%): protein 15-25%, carbs 45-65%, fat 20-35%
    #   3. Micro coverage (30%): trung bình % đạt RDA của 4 vi chất
    CALORIE_TARGET = 2100

    # 1. Calorie adherence score (0-100)
    if avg_calories > 0:
        cal_ratio = avg_calories / CALORIE_TARGET
        # Penalty tăng dần khi lệch khỏi mục tiêu
        cal_deviation = abs(1 - cal_ratio)
        cal_score = max(0, 100 - cal_deviation * 150)
    else:
        cal_score = 0

    # 2. Macro balance score (0-100)
    if macro_total > 0:
        p_pct = total_protein / macro_total * 100
        c_pct = total_carbs / macro_total * 100
        f_pct = total_fat / macro_total * 100
        # Mỗi macro: 0 nếu ngoài range, 100 nếu trong range, tuyến tính ở biên
        def macro_score(val, lo, hi):
            if lo <= val <= hi:
                return 100
            elif val < lo:
                return max(0, 100 - (lo - val) * 10)
            else:
                return max(0, 100 - (val - hi) * 10)
        m_score = (macro_score(p_pct, 15, 25) + macro_score(c_pct, 45, 65) + macro_score(f_pct, 20, 35)) / 3
    else:
        m_score = 0

    # 3. Micro coverage score (0-100)
    micro_avg = (iron_pct + calcium_pct + vitc_pct + zinc_pct) / 4

    # Tổng hợp
    nutrition_score = round(cal_score * 0.4 + m_score * 0.3 + micro_avg * 0.3)
    if log_count == 0:
        nutrition_score = 0

    # ─── AI Insights (OpenAI — có cache) ───────────────────────────────
    if cached is not None:
        # Cache hit: dùng lại ai_insights từ cache, skip OpenAI call
        ai_insights = cached.get("ai_insights", [])
        logger.debug(f"Using cached AI insights for user {user_id}")
    else:
        # Cache miss: gọi OpenAI
        ai_insights = await _generate_ai_insights(
            avg_calories=avg_calories,
            macro_ratios={"protein": round(total_protein / macro_total * 100) if macro_total > 0 else 0,
                          "carbs": round(total_carbs / macro_total * 100) if macro_total > 0 else 0,
                          "fat": round(total_fat / macro_total * 100) if macro_total > 0 else 0},
            micro_pcts={"iron": iron_pct, "calcium": calcium_pct, "vitamin_c": vitc_pct, "zinc": zinc_pct},
            log_count=log_count,
            num_days=num_days,
            gestation_weeks=None,
        )

    result = {
        "summary": {
            "avg_calories": avg_calories,
            "total_protein": round(total_protein),
            "total_carbs": round(total_carbs),
            "total_fat": round(total_fat),
            "log_count": log_count,
        },
        "history": history,
        "macro_ratios": macro_ratios,
        "micro_nutrients": micro_nutrients,
        "nutrition_score": nutrition_score,
        "ai_insights": ai_insights,
    }

    # Lưu vào cache (cả khi cache hit để cập nhật data mới nhất)
    _set_cached_summary(user_id, result, log_count)

    return result


async def _generate_ai_insights(
    avg_calories: float,
    macro_ratios: dict,
    micro_pcts: dict,
    log_count: int,
    num_days: int,
    gestation_weeks: Optional[int] = None,
) -> list:
    """
    Phân tích dinh dưỡng bằng OpenAI, trả về danh sách insights.
    Mỗi insight: { type: "warning"|"success"|"info", title: str, message: str }
    Fallback: dùng rule-based nếu không có API key hoặc lỗi.
    """
    # Luôn tạo rule-based insights trước (làm fallback + bổ sung)
    rules = _rule_based_insights(avg_calories, macro_ratios, micro_pcts, log_count)

    if not OPENAI_API_KEY or log_count == 0:
        return rules

    try:
        prompt = f"""Bạn là chuyên gia dinh dưỡng thai kỳ Việt Nam. Phân tích dữ liệu dinh dưỡng {num_days} ngày gần đây của một mẹ bầu:

Dữ liệu:
- Calo trung bình/ngày: {avg_calories} kcal (mục tiêu: 2100 kcal)
- Tỉ lệ macro: Protein {macro_ratios['protein']}%, Carbs {macro_ratios['carbs']}%, Fat {macro_ratios['fat']}%
- Vi chất (% đạt RDA): Sắt {micro_pcts['iron']}%, Canxi {micro_pcts['calcium']}%, Vitamin C {micro_pcts['vitamin_c']}%, Kẽm {micro_pcts['zinc']}%
- Số bữa ghi nhận: {log_count} bữa trong {num_days} ngày

Trả về JSON array, mỗi phần tử là một nhận xét (tối đa 3, tối thiểu 1):
[
  {{
    "type": "warning" | "success" | "info",
    "title": "Tiêu đề ngắn (dưới 8 từ)",
    "message": "Giải thích ngắn gọn + gợi ý cụ thể (1-2 câu, dưới 50 từ)"
  }}
]

Quy tắc:
- "warning": khi chỉ số dưới 60% mục tiêu hoặc mất cân bằng rõ
- "success": khi chỉ số đạt hoặc vượt 80% mục tiêu
- "info": gợi ý cải thiện nhẹ
- Ưu tiên vấn đề nghiêm trọng nhất trước
- Luôn gợi ý thực phẩm Việt Nam cụ thể
- Chỉ trả về JSON, không giải thích thêm"""

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 400,
                },
            )

        if response.status_code != 200:
            logger.warning(f"OpenAI insights failed: {response.status_code}")
            return rules

        text = _extract_text_from_openai_response(response.json())
        parsed = _parse_json_from_response(text)

        # Validate format
        if isinstance(parsed, list):
            valid = []
            for item in parsed[:3]:
                if isinstance(item, dict) and all(k in item for k in ("type", "title", "message")):
                    if item["type"] in ("warning", "success", "info"):
                        valid.append(item)
            if valid:
                return valid

        return rules

    except Exception as e:
        logger.warning(f"AI insights error, using rules: {e}")
        return rules


def _rule_based_insights(
    avg_calories: float,
    macro_ratios: dict,
    micro_pcts: dict,
    log_count: int,
) -> list:
    """Fallback rule-based insights khi không có OpenAI."""
    if log_count == 0:
        return [{"type": "info", "title": "Chưa có dữ liệu", "message": "Hãy quét ảnh bữa ăn hoặc lưu thực đơn để nhận phân tích dinh dưỡng chi tiết."}]

    insights = []

    # Calorie check
    if avg_calories > 0 and avg_calories < 1500:
        insights.append({"type": "warning", "title": "Calo quá thấp", "message": f"Trung bình chỉ {round(avg_calories)} kcal/ngày, thấp hơn nhiều so với mục tiêu 2100 kcal. Mẹ cần ăn thêm các bữa phụ giàu năng lượng."})
    elif avg_calories > 2800:
        insights.append({"type": "warning", "title": "Calo vượt mục tiêu", "message": f"Trung bình {round(avg_calories)} kcal/ngày, cao hơn khuyến nghị. Nên giảm bớt đồ chiên, đồ ngọt."})
    elif avg_calories >= 1800:
        insights.append({"type": "success", "title": "Calo ổn định", "message": f"Trung bình {round(avg_calories)} kcal/ngày, gần mục tiêu 2100 kcal. Duy trì nhé!"})

    # Micro check — tìm vi chất thấp nhất
    micro_items = [
        ("Sắt", micro_pcts["iron"], "thịt bò, rau bina, đậu lăng"),
        ("Canxi", micro_pcts["calcium"], "sữa, phô mai, tôm, cá nhỏ"),
        ("Vitamin C", micro_pcts["vitamin_c"], "cam, ổi, ớt chuông, bưởi"),
        ("Kẽm", micro_pcts["zinc"], "thịt bò, hạt bí, đậu nành"),
    ]
    micro_items.sort(key=lambda x: x[1])

    lowest = micro_items[0]
    if lowest[1] < 50:
        insights.append({"type": "warning", "title": f"Thiếu {lowest[0]} nghiêm trọng", "message": f"Chỉ đạt {lowest[1]}% mục tiêu. Bổ sung từ: {lowest[2]}."})
    elif lowest[1] < 80:
        insights.append({"type": "info", "title": f"Cần thêm {lowest[0]}", "message": f"Đạt {lowest[1]}% mục tiêu. Thêm {lowest[2]} vào bữa ăn."})

    # Tìm vi chất tốt nhất
    highest = micro_items[-1]
    if highest[1] >= 80:
        insights.append({"type": "success", "title": f"Duy trì {highest[0]} tốt", "message": f"Đạt {highest[1]}% mục tiêu — tiếp tục duy trì chế độ ăn hiện tại."})

    return insights[:3] if insights else [
        {"type": "info", "title": "Đang theo dõi", "message": "Tiếp tục ghi nhận bữa ăn để có phân tích chi tiết hơn."}
    ]
