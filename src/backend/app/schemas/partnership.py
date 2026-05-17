from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PartnershipCreate(BaseModel):
    partner_email: str

class PartnershipResponse(BaseModel):
    id: UUID
    mother_id: UUID
    father_id: Optional[UUID]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
