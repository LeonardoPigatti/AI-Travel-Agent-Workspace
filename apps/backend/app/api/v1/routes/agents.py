import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.agent import AgentRunRequest
from app.models.trip import AgentSession, Message
from app.repositories.trip_repository import TripRepository

sys.path.insert(0, str(Path(__file__).parents[6] / "services" / "ai-agents"))

router = APIRouter(prefix="/agents", tags=["agents"])

NODE_NAME_MAP = {
    "destination_node": "Destination",
    "budget_node": "Budget",
    "hotel_node": "Hotel",
    "itinerary_node": "Itinerary",
    "coordinator_node": "Coordinator",
}


@router.post("/run")
async def run_agent(
    request: AgentRunRequest,
    db: AsyncSession = Depends(get_db),
):
    repo = TripRepository(db)
    trip = await repo.get_by_id(request.trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if request.session_id:
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

    user_message = Message(
        session_id=session.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.flush()

    session_id = session.id
    trip_data = {
        "destination": trip.destination,
        "duration_days": trip.duration_days,
        "budget": float(trip.budget),
        "currency": trip.currency,
        "preferences": trip.preferences or "",
        "trip_id": str(trip.id),
    }

    async def stream():
        from graph.workflow import graph
        from langchain_core.messages import HumanMessage

        state = {
            "messages": [HumanMessage(content=request.message)],
            "current_agent": "",
            "is_complete": False,
            "destination_research": "",
            "budget_breakdown": "",
            "hotel_suggestions": "",
            "itinerary_draft": "",
            "final_itinerary": "",
            **trip_data,
        }

        full_response = ""
        agent_name = "Coordinator"

        yield f"data: [AGENT:{agent_name}]\n\n"

        async for event in graph.astream_events(state, version="v2"):
            kind = event.get("event")

            if kind == "on_chain_start":
                node = event.get("name", "")
                if node in NODE_NAME_MAP:
                    agent_name = NODE_NAME_MAP[node]
                    yield f"data: [AGENT:{agent_name}]\n\n"

            if kind == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                token = chunk.content
                if token:
                    full_response += token
                    yield f"data: {token}\n\n"

        async with db.begin_nested():
            agent_msg = Message(
                session_id=session_id,
                role="agent",
                agent_name=agent_name,
                content=full_response,
            )
            db.add(agent_msg)

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