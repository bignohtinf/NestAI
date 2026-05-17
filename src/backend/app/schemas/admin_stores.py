from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: str
    city: str
    district: Optional[str] = None
    ward: Optional[str] = None
    postalCode: Optional[str] = Field(None, alias="postal_code")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operatingHours: Optional[str] = Field(None, alias="operating_hours")
    status: str = "active"

    class Config:
        populate_by_name = True

class StoreCreate(StoreBase):
    pass

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    postalCode: Optional[str] = Field(None, alias="postal_code")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operatingHours: Optional[str] = Field(None, alias="operating_hours")
    status: Optional[str] = None

    class Config:
        populate_by_name = True

class StoreSummary(StoreBase):
    id: str
    foodItemsCount: int = Field(0, alias="food_items_count")
    createdAt: datetime = Field(..., alias="created_at")
    lastUpdated: datetime = Field(..., alias="updated_at")

class StoreListResponse(BaseModel):
    stores: List[StoreSummary]
    total: int
    limit: int
    offset: int

class StoreFoodMappingBase(BaseModel):
    storeId: str = Field(..., alias="store_id")
    dishStt: int = Field(..., alias="dish_stt")
    availability: bool = True
    priceAtStore: Optional[float] = Field(None, alias="price_at_store")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True

class StoreFoodMappingCreate(StoreFoodMappingBase):
    pass

class StoreFoodMappingSummary(StoreFoodMappingBase):
    id: str
    storeName: Optional[str] = Field(None, alias="store_name")
    dishName: Optional[str] = Field(None, alias="dish_name")
    lastUpdated: datetime = Field(..., alias="updated_at")

class StoreFoodMappingListResponse(BaseModel):
    mappings: List[StoreFoodMappingSummary]
    total: int
    limit: int
    offset: int

class StoreLocation(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    address: str
    foodItemsCount: int = Field(0, alias="food_items_count")

class StoreLocationsResponse(BaseModel):
    stores: List[StoreLocation]
    center: Dict[str, float]
    bounds: Optional[Dict[str, float]] = None
