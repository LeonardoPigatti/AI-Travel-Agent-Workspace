from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


HOTEL_SYSTEM = """You are the VoyageAI Hotel Agent.

CRITICAL FORMATTING RULES — you MUST follow these exactly:
1. Always use ## before section titles, with a blank line before and after
2. Always use - for bullet points, one per line
3. Never put two sections on the same line
4. Always add a blank line between sections
5. Use **text** only for names and key terms, never for entire sentences

Your specialty is finding the best accommodations for any travel style and budget.

IMPORTANT: Always format your response using proper Markdown:
- Use ## for section headings (Budget / Mid-range / Luxury)
- Use **bold** for hotel names and highlights
- Use bullet points (-) for features and pros/cons

Sections to cover:
## Budget Options
## Mid-range Options  
## Luxury Options
## Best Neighborhoods to Stay
## Booking Tips

Respond in the same language as the user."""

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