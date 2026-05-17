import uuid
import sys
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.agent import AgentRunRequest
from app.models.trip import AgentSession, Message
from app.repositories.trip_repository import TripRepository

# Adiciona o serviço de agentes ao path
sys.path.insert(0, str(Path(__file__).parents[6] / "services" / "ai-agents"))

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("/run")
async def run_agent(
    request: AgentRunRequest,
    db: AsyncSession = Depends(get_db),
):
    repo = TripRepository(db)
    trip = await repo.get_by_id(request.trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Cria ou recupera sessão
    if request.session_id:
        from sqlalchemy import select
        result = await db.execute(
            select(AgentSession).where(AgentSession.id == request.session_id)
        )
        session = result.scalar_one_or_none()
    else:
        session = None

    if not session:
        session = AgentSession(trip_id=trip.id)
        db.add(session)
        await db.flush()
        await db.refresh(session)

    # Salva mensagem do usuário
    user_message = Message(
        session_id=session.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.flush()

    session_id = session.id

    async def stream():
        from graph.workflow import graph
        from langchain_core.messages import HumanMessage

        state = {
            "messages": [HumanMessage(content=request.message)],
            "trip_id": str(trip.id),
            "destination": trip.destination,
            "duration_days": trip.duration_days,
            "budget": float(trip.budget),
            "currency": trip.currency,
            "preferences": trip.preferences or "",
            "current_agent": "",
            "is_complete": False,
            "destination_research": "",
            "budget_breakdown": "",
            "hotel_suggestions": "",
            "itinerary_draft": "",
            "final_itinerary": "",
        }

        full_response = ""

        # Streaming token por token
        async for event in graph.astream_events(state, version="v2"):
            kind = event.get("event")
            if kind == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                token = chunk.content
                if token:
                    full_response += token
                    yield f"data: {token}\n\n"

        # Salva resposta do agente no banco
        async with db.begin_nested():
            agent_message = Message(
                session_id=session_id,
                role="agent",
                agent_name="Coordinator",
                content=full_response,
            )
            db.add(agent_message)

        yield f"data: [DONE]\n\n"
        yield f"data: [SESSION:{session_id}]\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )