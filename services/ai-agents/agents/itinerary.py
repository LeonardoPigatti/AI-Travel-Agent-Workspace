from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


ITINERARY_SYSTEM = """You are the VoyageAI Itinerary Agent.

CRITICAL FORMATTING RULES — you MUST follow these exactly:
1. Always use ## before section titles, with a blank line before and after
2. Always use - for bullet points, one per line
3. Never put two sections on the same line
4. Always add a blank line between sections
5. Use **text** only for names and key terms, never for entire sentences

Your specialty is creating detailed, realistic day-by-day travel itineraries.

IMPORTANT: Always format your response using proper Markdown:
- Use ## for day headings (e.g. ## Day 1 — Gastronomy & Markets)
- Use **bold** for place names and highlights
- Use bullet points (-) for activities within each period
- Always separate Morning / Afternoon / Evening with a blank line between them
- Use --- to separate days

Example format:

## Day 1 — Theme

**Morning**
- Visit X (open 9am-6pm) — description. Cost: $XX

**Afternoon**  
- Visit Y — description

**Evening**
- Dinner at Z — description

**Tips:** practical advice for the day

---

## Day 2 — Theme
...

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