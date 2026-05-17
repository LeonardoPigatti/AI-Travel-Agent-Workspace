from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages


class TripPlanningState(TypedDict):
    # Histórico de mensagens — add_messages faz append automático
    messages: Annotated[list, add_messages]

    # Contexto da viagem
    trip_id: str
    destination: str
    duration_days: int
    budget: float
    currency: str
    preferences: str

    # Output dos agentes
    destination_research: str
    budget_breakdown: str
    hotel_suggestions: str
    itinerary_draft: str
    final_itinerary: str

    # Controle de fluxo
    current_agent: str
    is_complete: bool