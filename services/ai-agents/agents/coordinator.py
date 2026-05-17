from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from graph.state import TripPlanningState
from agents.base import BaseAgent


COORDINATOR_SYSTEM = """You are the VoyageAI Coordinator Agent. 
You help users plan their perfect trips by understanding their needs and coordinating specialist agents.

You have access to these specialist agents:
- Destination Agent: researches places, attractions, culture
- Budget Agent: calculates costs and optimizes spending  
- Hotel Agent: finds accommodations
- Itinerary Agent: creates day-by-day schedules

For each user message:
1. Understand what they need
2. Provide helpful, specific travel advice
3. Ask clarifying questions when needed
4. Be concise and actionable

Always respond in the same language as the user.
Trip context will be provided automatically."""


class CoordinatorAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Coordinator")

    async def run(self, state: TripPlanningState) -> dict:
        system = SystemMessage(content=COORDINATOR_SYSTEM)

        context = HumanMessage(content=f"""
Trip context:
- Destination: {state.get('destination', 'Not set')}
- Duration: {state.get('duration_days', 0)} days
- Budget: {state.get('currency', 'BRL')} {state.get('budget', 0)}
- Preferences: {state.get('preferences', 'None')}
""")

        messages = [system, context] + state["messages"]
        response = await self.llm.ainvoke(messages)

        return {
            "messages": [AIMessage(content=response.content, name="Coordinator")],
            "current_agent": "coordinator",
        }