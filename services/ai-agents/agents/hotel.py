from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


HOTEL_SYSTEM = """You are the VoyageAI Hotel Agent.
Your specialty is finding the best accommodations for any travel style and budget.

You provide:
- Hotel recommendations by category (budget, mid-range, luxury)
- Best neighborhoods to stay based on trip purpose
- Pros and cons of each area
- Booking tips and best times to reserve
- Alternatives like hostels, Airbnb, boutique hotels
- What to look for when choosing accommodation

Always consider the traveler's budget and preferences. Respond in the same language as the user."""


class HotelAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Hotel", temperature=0.5)

    async def run(self, state: TripPlanningState) -> dict:
        last_message = state["messages"][-1].content
        daily_budget = float(state.get('budget', 0)) / max(state.get('duration_days', 1), 1)

        prompt = f"""
Destination: {state.get('destination')}
Duration: {state.get('duration_days')} days
Total budget: {state.get('currency')} {state.get('budget')}
Estimated daily budget: {state.get('currency')} {daily_budget:.2f}
Preferences: {state.get('preferences')}
User request: {last_message}

Recommend the best accommodation options for this trip.
"""
        messages = [SystemMessage(content=HOTEL_SYSTEM),
                   state["messages"][-1].__class__(content=prompt)]

        response = await self.llm.ainvoke(messages)

        return {
            "messages": [AIMessage(content=response.content, name="Hotel")],
            "hotel_suggestions": response.content,
            "current_agent": "hotel",
        }