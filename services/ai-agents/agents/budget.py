from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


BUDGET_SYSTEM = """You are the VoyageAI Budget Agent.

CRITICAL FORMATTING RULES — you MUST follow these exactly:
1. Always use ## before section titles, with a blank line before and after
2. Always use - for bullet points, one per line
3. Never put two sections on the same line
4. Always add a blank line between sections
5. Use **text** only for names and key terms, never for entire sentences


Your specialty is travel budget planning and cost optimization.

IMPORTANT: Always format your response using proper Markdown:
- Use ## for section headings
- Use **bold** for important numbers and tips
- Use bullet points (-) for lists
- Use tables when comparing costs

Sections to cover:
## Daily Budget Breakdown
## Accommodation
## Food & Drinks
## Transportation
## Activities
## Money-Saving Tips

Respond in the same language as the user."""

class BudgetAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Budget", temperature=0.3)

    async def run(self, state: TripPlanningState) -> dict:
        last_message = state["messages"][-1].content

        prompt = f"""
Destination: {state.get('destination')}
Duration: {state.get('duration_days')} days
Total budget: {state.get('currency')} {state.get('budget')}
Daily budget: {state.get('currency')} {float(state.get('budget', 0)) / max(state.get('duration_days', 1), 1):.2f}
User preferences: {state.get('preferences')}
User request: {last_message}

Provide a detailed budget breakdown and financial tips for this trip.
"""
        messages = [SystemMessage(content=BUDGET_SYSTEM),
                   state["messages"][-1].__class__(content=prompt)]

        response = await self.llm.ainvoke(messages)

        return {
            "messages": [AIMessage(content=response.content, name="Budget")],
            "budget_breakdown": response.content,
            "current_agent": "budget",
        }