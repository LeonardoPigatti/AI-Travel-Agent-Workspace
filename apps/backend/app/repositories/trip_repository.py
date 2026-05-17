import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trip import Trip, TripStatus
from app.schemas.trip import TripCreate, TripUpdate


class TripRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: TripCreate) -> Trip:
        trip = Trip(**data.model_dump())
        self.db.add(trip)
        await self.db.flush()
        await self.db.refresh(trip)
        return trip

    async def get_by_id(self, trip_id: uuid.UUID) -> Trip | None:
        result = await self.db.execute(
            select(Trip).where(Trip.id == trip_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 20) -> tuple[list[Trip], int]:
        total_result = await self.db.execute(select(func.count(Trip.id)))
        total = total_result.scalar_one()

        result = await self.db.execute(
            select(Trip).offset(skip).limit(limit).order_by(Trip.created_at.desc())
        )
        trips = list(result.scalars().all())
        return trips, total

    async def update(self, trip: Trip, data: TripUpdate) -> Trip:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(trip, field, value)
        await self.db.flush()
        await self.db.refresh(trip)
        return trip

    async def delete(self, trip: Trip) -> None:
        await self.db.delete(trip)
        await self.db.flush()

    async def update_status(self, trip: Trip, status: TripStatus) -> Trip:
        trip.status = status
        await self.db.flush()
        await self.db.refresh(trip)
        return trip