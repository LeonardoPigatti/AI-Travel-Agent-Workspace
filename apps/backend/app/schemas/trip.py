import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class TripCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    destination: str = Field(..., min_length=2, max_length=255)
    duration_days: int = Field(..., ge=1, le=365)
    budget: Decimal = Field(..., gt=0)
    currency: str = Field(default="BRL", max_length=3)
    preferences: str | None = Field(default=None, max_length=2000)


class TripUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    destination: str | None = Field(default=None, min_length=2, max_length=255)
    duration_days: int | None = Field(default=None, ge=1, le=365)
    budget: Decimal | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, max_length=3)
    preferences: str | None = Field(default=None, max_length=2000)


class TripResponse(BaseModel):
    id: uuid.UUID
    title: str
    destination: str
    duration_days: int
    budget: Decimal
    currency: str
    preferences: str | None
    status: str
    itinerary: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TripListResponse(BaseModel):
    items: list[TripResponse]
    total: int