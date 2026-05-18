import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.trip import Trip, AgentSession, Message
from app.repositories.trip_repository import TripRepository
from app.services.pdf_service import generate_itinerary_pdf

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/trips/{trip_id}/pdf")
async def export_trip_pdf(
    trip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = TripRepository(db)
    trip = await repo.get_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Busca sessão mais recente
    result = await db.execute(
        select(AgentSession)
        .where(AgentSession.trip_id == trip_id)
        .order_by(AgentSession.created_at.desc())
        .limit(1)
    )
    session = result.scalar_one_or_none()

    messages = []
    if session:
        msg_result = await db.execute(
            select(Message)
            .where(Message.session_id == session.id)
            .order_by(Message.created_at.asc())
        )
        messages = list(msg_result.scalars().all())

    pdf_bytes = generate_itinerary_pdf(trip, messages)

    filename = f"voyageai-{trip.destination.split(',')[0].lower().replace(' ', '-')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
        },
    )