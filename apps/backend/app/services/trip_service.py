import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.trip_repository import TripRepository
from app.schemas.trip import TripCreate, TripUpdate, TripResponse, TripListResponse


class TripService:
    def __init__(self, db: AsyncSession):
        self.repo = TripRepository(db)

    async def create_trip(self, data: TripCreate) -> TripResponse:
        trip = await self.repo.create(data)
        return TripResponse.model_validate(trip)

    async def get_trip(self, trip_id: uuid.UUID) -> TripResponse:
        trip = await self.repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip {trip_id} not found",
            )
        return TripResponse.model_validate(trip)

    async def list_trips(self, skip: int = 0, limit: int = 20) -> TripListResponse:
        trips, total = await self.repo.get_all(skip=skip, limit=limit)
        return TripListResponse(
            items=[TripResponse.model_validate(t) for t in trips],
            total=total,
        )

    async def update_trip(self, trip_id: uuid.UUID, data: TripUpdate) -> TripResponse:
        trip = await self.repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip {trip_id} not found",
            )
        updated = await self.repo.update(trip, data)
        return TripResponse.model_validate(updated)

    async def delete_trip(self, trip_id: uuid.UUID) -> None:
        trip = await self.repo.get_by_id(trip_id)
        if not trip:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip {trip_id} not found",
            )
        await self.repo.delete(trip)