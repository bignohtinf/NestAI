from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from app.services.multi_dish_processor import MultiDishProcessor
from pydantic import BaseModel
from typing import Optional, List
import difflib
import httpx
import json
import os
import re
import asyncio

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

SYSTEM_PROMPT = """Bạn là chuyên gia nhận diện món ăn Việt Nam cho thai kỳ.
Nhiệm vụ: nhận diện TẤT CẢ các món ăn trong ảnh ở mức CHI TIET, không gọi tên chung chung.

YEU CAU NHAN DIEN:
1) Ten mon phai day du theo bien the + cach che bien + nhan/chinh:
   - Tot: "banh mi pate", "banh mi trung op la", "banh mi thit nuong", "pho bo tai", "bun bo hue"
   - Khong tot: "banh mi", "pho", "bun"
2) Uu tien thanh phan nhin thay ro trong anh (pate, trung, thit nuong, cha, ca, tom, bo, ga, ...).
3) Chi duoc chon bien the khi co dau hieu thi giac hop ly.
   - Neu khong du chac chan de ket luan bien the, tra ve ten mon + "khong ro bien the".
4) Khong duoc tu suy dien qua muc tu nhung chi tiet khong co trong anh.
5) estimated_grams phai la uoc luong khau phan thuc te trong anh.
6) QUAN TRONG: Tra ve TAT CA cac mon an nhin thay trong anh, khong chi mon dau tien.

Tra ve dung JSON sau, KHONG giai thich them:
{
  "dishes": [
    {
      "name": "tên món chuẩn tiếng Việt",
      "estimated_grams": 250,
      "confidence": 0.85
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
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": SYSTEM_PROMPT},
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


def _normalize_text(value: Optional[str]) -> str:
    if not value:
        return ""
    return value.strip().lower()


@router.post("/analyze-photo", response_model=PhotoAnalysisResponse)
async def analyze_photo(payload: PhotoAnalysisRequest, supabase = Depends(get_supabase)):
    """Analyze a meal photo with OpenAI vision and match all dishes against nutrition database."""
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
    if not dishes or not isinstance(dishes, list):
        raise HTTPException(status_code=400, detail="No dishes detected in image")
    
    if len(dishes) == 0:
        raise HTTPException(status_code=400, detail="No dishes detected in image")

    meal_context = parsed.get("meal_context")

    matched_food, match_score, suggestions = _get_best_food_match(supabase, dish_name)
    calories = 0.0
    protein = 0.0
    carbs = 0.0
    fat = 0.0
    iron = None
    calcium = None

    if matched_food and match_score >= 0.35:
        energy = float(matched_food.get("energy") or 0)
        protein = float(matched_food.get("protein") or 0)
        carbs = float(matched_food.get("carbohydrate") or 0)
        fat = float(matched_food.get("fat") or 0)
        iron = matched_food.get("iron")
        calcium = matched_food.get("calcium")
        
        if energy <= 0:
            energy = (protein * 4) + (carbs * 4) + (fat * 9)
            
        calories = round((energy * estimated_grams) / 100.0, 1)
        protein = round((protein * estimated_grams) / 100.0, 1)
        carbs = round((carbs * estimated_grams) / 100.0, 1)
        fat = round((fat * estimated_grams) / 100.0, 1)

    return {
        "dish_name": dish_name,
        "estimated_grams": round(estimated_grams, 1),
        "confidence": round(confidence, 3),
        "meal_context": meal_context,
        "matched_food": matched_food,
        "match_score": round(match_score, 3),
        "suggestions": suggestions,
        "calories": calories,
        "protein": protein,
        "carbs": carbs,
        "fat": fat,
        "iron": iron,
        "calcium": calcium,
        "pregnancy_benefit": _build_pregnancy_benefit(matched_food),
    }

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
