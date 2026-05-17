from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# Nutrition Profiles Schemas
class NutritionProfileBase(BaseModel):
    stt: int
    age_group: Optional[str] = None
    gender: Optional[str] = None
    labor_level: Optional[str] = None
    physiological_condition: Optional[str] = None

class NutritionProfileCreate(NutritionProfileBase):
    pass

class NutritionProfileUpdate(BaseModel):
    age_group: Optional[str] = None
    gender: Optional[str] = None
    labor_level: Optional[str] = None
    physiological_condition: Optional[str] = None

class NutritionProfileDetail(NutritionProfileBase):
    id: str
    created_at: datetime

class NutritionProfileListResponse(BaseModel):
    profiles: List[NutritionProfileDetail]
    total: int

# Nutrition Recommendations Schemas
class NutritionRecommendationBase(BaseModel):
    profile_stt: int
    nutrient_name: str
    unit: Optional[str] = None
    value_str: str

class NutritionRecommendationCreate(NutritionRecommendationBase):
    pass

class NutritionRecommendationUpdate(BaseModel):
    nutrient_name: Optional[str] = None
    unit: Optional[str] = None
    value_str: Optional[str] = None

class NutritionRecommendationDetail(NutritionRecommendationBase):
    id: str
    created_at: datetime

class NutritionRecommendationListResponse(BaseModel):
    recommendations: List[NutritionRecommendationDetail]
    total: int

# Combined Response for Profile with Recommendations
class NutritionProfileWithRecommendations(NutritionProfileDetail):
    recommendations: List[NutritionRecommendationDetail] = []
