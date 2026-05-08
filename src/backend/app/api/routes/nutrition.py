from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from app.services.embedding_service import EmbeddingService
from app.services.vector_search_service import VectorSearchService
from pydantic import BaseModel
from typing import Optional, List
import httpx
import json
import logging
import os
import re
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter()

class NutritionLogCreate(BaseModel):
    meal_name: str
    calories: float
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

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
      "fat_per_100g": 11.0
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
                        "max_tokens": 800,
                    },
                )

            if response.status_code == 200:
                return response.json()
            
            # Retry on 502, 503, 504 (server errors)
            if response.status_code in [502, 503, 504]:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)  # exponential backoff
                    print(f"OpenAI API returned {response.status_code}, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
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
                print(f"OpenAI API timeout, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait_time)
                continue
            raise HTTPException(status_code=504, detail="OpenAI API timeout after multiple retries")
        
        except HTTPException:
            raise
        except Exception as exc:
            if attempt < max_retries - 1:
                wait_time = retry_delay * (2 ** attempt)
                print(f"OpenAI API error: {str(exc)}, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
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

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.S)
        if not match:
            raise ValueError("Unable to parse JSON from OpenAI response")
        return json.loads(match.group(0))


_DB_MATCH_THRESHOLD = 0.85  # Only accept DB canonical name if similarity >= this value


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


def _try_db_enrich(supabase, dish_name: str) -> tuple[Optional[dict], float]:
    """
    Try to find a canonical DB entry for the dish name via vector similarity.
    Returns (matched_food, score). Only meaningful if score >= _DB_MATCH_THRESHOLD.
    Silently returns (None, 0.0) on any error so the main flow is never interrupted.
    """
    try:
        embedding_svc = EmbeddingService()
        embedding = embedding_svc.embed_text(dish_name)
        if not embedding:
            return None, 0.0

        vs = VectorSearchService(supabase)
        if not vs._verify_pgvector_available():
            return None, 0.0

        results = vs.search_similar_dishes(embedding, top_k=1)
        if not results:
            return None, 0.0

        top = results[0]
        score = float(top.get("match_score", 0.0))
        if score >= _DB_MATCH_THRESHOLD:
            return top, score
        return None, score
    except Exception as exc:
        logger.debug(f"DB enrich skipped for '{dish_name}': {exc}")
        return None, 0.0


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

        # --- Optional DB enrichment (async offload to thread to avoid blocking event loop) ---
        loop = asyncio.get_event_loop()
        matched_food, match_score = await loop.run_in_executor(
            None, _try_db_enrich, supabase, name
        )

        # --- Pregnancy benefit (based on AI-calculated nutrition, not DB) ---
        pregnancy_benefit = _pregnancy_benefit_from_nutrition(protein, fat, None, None)

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
            iron=None,
            calcium=None,
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
    """Get nutrition logs for a user"""
    result = supabase.table("nutrition_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    return {"logs": result.data or []}

@router.post("/logs")
async def create_nutrition_log(user_id: str, log: NutritionLogCreate, supabase = Depends(get_supabase)):
    """Create a nutrition log entry"""
    result = supabase.table("nutrition_logs").insert({
        "user_id": user_id,
        "meal_name": log.meal_name,
        "calories": log.calories,
        "protein": log.protein,
        "carbs": log.carbs,
        "fat": log.fat,
        "image_url": log.image_url,
        "notes": log.notes
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create nutrition log")
    
    return {"status": "created", "data": result.data[0]}

@router.get("/summary")
async def get_nutrition_summary(user_id: str, days: int = 7, supabase = Depends(get_supabase)):
    """Get nutrition summary for the past N days"""
    result = supabase.table("nutrition_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(days * 3).execute()
    
    logs = result.data or []
    total_calories = sum(log.get("calories", 0) for log in logs)
    total_protein = sum(log.get("protein", 0) for log in logs if log.get("protein"))
    avg_calories = total_calories / len(logs) if logs else 0
    
    return {
        "total_calories": total_calories,
        "total_protein": total_protein,
        "avg_calories": avg_calories,
        "log_count": len(logs)
    }
