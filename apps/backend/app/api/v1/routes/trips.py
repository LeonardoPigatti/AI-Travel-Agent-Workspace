import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.trip import TripCreate, TripUpdate, TripResponse, TripListResponse
from app.services.trip_service import TripService

router = APIRouter(prefix="/trips", tags=["trips"])


def get_trip_service(db: AsyncSession = Depends(get_db)) -> TripService:
    return TripService(db)


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    data: TripCreate,
    service: TripService = Depends(get_trip_service),
):
    return await service.create_trip(data)


@router.get("/", response_model=TripListResponse)
async def list_trips(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    service: TripService = Depends(get_trip_service),
):
    return await service.list_trips(skip=skip, limit=limit)


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: uuid.UUID,
    service: TripService = Depends(get_trip_service),
):
    return await service.get_trip(trip_id)


@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: uuid.UUID,
    data: TripUpdate,
    service: TripService = Depends(get_trip_service),
):
    return await service.update_trip(trip_id, data)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: uuid.UUID,
    service: TripService = Depends(get_trip_service),
):
    await service.delete_trip(trip_id)