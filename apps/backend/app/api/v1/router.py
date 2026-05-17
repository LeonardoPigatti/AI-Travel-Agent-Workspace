from fastapi import APIRouter
from app.api.v1.routes.trips import router as trips_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(trips_router)