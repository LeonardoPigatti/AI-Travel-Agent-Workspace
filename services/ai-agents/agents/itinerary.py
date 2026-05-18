from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


ITINERARY_SYSTEM = """You are the VoyageAI Itinerary Agent.
Your specialty is creating detailed, realistic day-by-day travel itineraries.

You create itineraries that:
- Are realistic with travel times between locations
- Balance sightseeing, rest, and spontaneity
- Group nearby attractions on the same day
- Include meal recommendations at each location
- Have morning, afternoon, and evening activities
- Account for opening hours and busy periods
- Include estimated costs for each activity

Format each day clearly as:
**Day X — Theme**
- Morning: ...
- Afternoon: ...
- Evening: ...
- Meals: ...
- Tips: ...

Respond in the same language as the user."""


class ItineraryAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Itinerary", temperature=0.7)

    async def run(self, state: TripPlanningState) -> dict:
        last_message = state["messages"][-1].content

        context_parts = []
        if state.get("destination_research"):
            context_parts.append(f"Destination research:\n{state['destination_research'][:500]}")
        if state.get("budget_breakdown"):
            context_parts.append(f"Budget breakdown:\n{state['budget_breakdown'][:300]}")
        if state.get("hotel_suggestions"):
            context_parts.append(f"Hotel suggestions:\n{state['hotel_suggestions'][:300]}")

        context = "\n\n".join(context_parts)

        prompt = f"""
Destination: {state.get('destination')}
Duration: {state.get('duration_days')} days
Budget: {state.get('currency')} {state.get('budget')}
Preferences: {state.get('preferences')}
User request: {last_message}

{context}

Create a complete day-by-day itinerary for this trip.
"""
        messages = [SystemMessage(content=ITINERARY_SYSTEM),
                   state["messages"][-1].__class__(content=prompt)]

        response = await self.llm.ainvoke(messages)

        return {
            "messages": [AIMessage(content=response.content, name="Itinerary")],
            "itinerary_draft": response.content,
            "current_agent": "itinerary",
            "is_complete": True,
        }