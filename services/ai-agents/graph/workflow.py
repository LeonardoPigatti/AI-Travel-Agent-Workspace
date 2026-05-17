from langgraph.graph import StateGraph, END
from graph.state import TripPlanningState
from agents.coordinator import CoordinatorAgent

coordinator = CoordinatorAgent()


async def coordinator_node(state: TripPlanningState) -> dict:
    return await coordinator.run(state)


def build_workflow() -> StateGraph:
    workflow = StateGraph(TripPlanningState)

    workflow.add_node("coordinator", coordinator_node)
    workflow.set_entry_point("coordinator")
    workflow.add_edge("coordinator", END)

    return workflow.compile()


# Instância singleton do grafo
graph = build_workflow()