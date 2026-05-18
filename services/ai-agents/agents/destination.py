from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


DESTINATION_SYSTEM = """You are the VoyageAI Destination Research Agent.
Your specialty is providing detailed information about travel destinations.

When given a destination, you research and provide:
- Top attractions and must-see places
- Cultural tips and local customs
- Best neighborhoods to stay and explore
- Hidden gems and local favorites
- Best time to visit specific attractions
- Transportation tips within the city

Be specific, practical, and enthusiastic. Always respond in the same language as the user's message."""


class DestinationAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Destination", temperature=0.7)

    async def run(self, state: TripPlanningState) -> dict:
        last_message = state["messages"][-1].content

        prompt = f"""
Destination: {state.get('destination')}
Duration: {state.get('duration_days')} days
User preferences: {state.get('preferences')}
User request: {last_message}

Provide detailed destination research based on the above context.
"""
        messages = [SystemMessage(content=DESTINATION_SYSTEM), 
                   *state["messages"][:-1],
                   state["messages"][-1].__class__(content=prompt)]
        
        response = await self.llm.ainvoke(messages)

        return {
            "messages": [AIMessage(content=response.content, name="Destination")],
            "destination_research": response.content,
            "current_agent": "destination",
        }