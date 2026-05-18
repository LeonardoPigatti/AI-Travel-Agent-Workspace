from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


BUDGET_SYSTEM = """You are the VoyageAI Budget Agent.
Your specialty is travel budget planning and cost optimization.

When given a trip budget, you provide:
- Daily budget breakdown (accommodation, food, transport, activities)
- Cost estimates for specific experiences
- Money-saving tips without sacrificing quality
- Currency exchange tips
- Credit card and payment advice for the destination
- Budget allocation recommendations

Always be practical and specific with numbers. Respond in the same language as the user."""


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