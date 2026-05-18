from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from graph.state import TripPlanningState
from agents.coordinator import CoordinatorAgent
from agents.destination import DestinationAgent
from agents.budget import BudgetAgent
from agents.hotel import HotelAgent
from agents.itinerary import ItineraryAgent
from agents.base import get_llm


coordinator = CoordinatorAgent()
destination_agent = DestinationAgent()
budget_agent = BudgetAgent()
hotel_agent = HotelAgent()
itinerary_agent = ItineraryAgent()


async def coordinator_node(state: TripPlanningState) -> dict:
    return await coordinator.run(state)


async def destination_node(state: TripPlanningState) -> dict:
    return await destination_agent.run(state)


async def budget_node(state: TripPlanningState) -> dict:
    return await budget_agent.run(state)


async def hotel_node(state: TripPlanningState) -> dict:
    return await hotel_agent.run(state)


async def itinerary_node(state: TripPlanningState) -> dict:
    return await itinerary_agent.run(state)


async def route_to_agent(state: TripPlanningState) -> str:
    last_message = state["messages"][-1].content.lower()

    llm = get_llm(temperature=0)
    routing_prompt = f"""
You are a router. Based on the user message, decide which specialist agent should handle it.

User message: "{last_message}"

Reply with ONLY one word:
- "destination_node" → questions about places, attractions, culture, what to do, where to go
- "budget_node" → questions about costs, money, prices, expenses, currency
- "hotel_node" → questions about accommodation, where to stay, hotels, hostels
- "itinerary_node" → requests for schedule, day-by-day plan, itinerary, full trip plan
- "coordinator_node" → general questions, greetings, unclear requests
"""
    response = await llm.ainvoke([HumanMessage(content=routing_prompt)])
    decision = response.content.strip().lower()

    valid = {"destination_node", "budget_node", "hotel_node", "itinerary_node", "coordinator_node"}
    return decision if decision in valid else "coordinator_node"


def build_workflow():
    workflow = StateGraph(TripPlanningState)

    workflow.add_node("router_node", lambda state: state)
    workflow.add_node("coordinator_node", coordinator_node)
    workflow.add_node("destination_node", destination_node)
    workflow.add_node("budget_node", budget_node)
    workflow.add_node("hotel_node", hotel_node)
    workflow.add_node("itinerary_node", itinerary_node)

    workflow.set_entry_point("router_node")

    workflow.add_conditional_edges(
        "router_node",
        route_to_agent,
        {
            "coordinator_node": "coordinator_node",
            "destination_node": "destination_node",
            "budget_node": "budget_node",
            "hotel_node": "hotel_node",
            "itinerary_node": "itinerary_node",
        }
    )

    for node in ["coordinator_node", "destination_node", "budget_node", "hotel_node", "itinerary_node"]:
        workflow.add_edge(node, END)

    return workflow.compile()


graph = build_workflow()