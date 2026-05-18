from langchain_core.messages import AIMessage, SystemMessage
from agents.base import BaseAgent
from graph.state import TripPlanningState


DESTINATION_SYSTEM = """You are the VoyageAI Destination Research Agent.

CRITICAL FORMATTING RULES — you MUST follow these exactly:
1. Always use ## before section titles, with a blank line before and after
2. Always use - for bullet points, one per line
3. Never put two sections on the same line
4. Always add a blank line between sections
5. Use **text** only for place names, never for entire sentences

Your response structure must be exactly:

## Top Attractions

- **Place Name**: description
- **Place Name**: description

## Cultural Tips

- tip one
- tip two

## Best Neighborhoods

- **Neighborhood**: description

## Hidden Gems

- **Place**: description

## Transportation Tips

- tip one
- tip two

Respond in the same language as the user."""
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