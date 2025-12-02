from typing import Literal, AsyncGenerator
from langgraph.graph import StateGraph, END

from .state import AgentState
from agents.orchestrator import OrchestratorAgent
from agents.researcher import ResearcherAgent
from agents.validator import ValidatorAgent
from agents.synthesizer import SynthesizerAgent
from db.mongodb import get_db_client


# Initialize agents
orchestrator = OrchestratorAgent()
researcher = ResearcherAgent()
validator = ValidatorAgent()
synthesizer = SynthesizerAgent()


async def orchestrator_node(state: AgentState) -> dict:
    """Orchestrator agent node."""
    return await orchestrator.process(state)


async def researcher_node(state: AgentState) -> dict:
    """Researcher agent node."""
    return await researcher.process(state)


async def validator_node(state: AgentState) -> dict:
    """Validator agent node."""
    return await validator.process(state)


async def synthesizer_node(state: AgentState) -> dict:
    """Synthesizer agent node."""
    return await synthesizer.process(state)


async def simple_response_node(state: AgentState) -> dict:
    """Simple response without research."""
    return await synthesizer.process_simple(state)


def should_research(state: AgentState) -> Literal["researcher", "simple_response"]:
    """Determine if research is needed."""
    if state.get("needs_research", True):
        return "researcher"
    return "simple_response"


def create_workflow() -> StateGraph:
    """Create the multi-agent workflow graph."""
    
    # Initialize the graph with state schema
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("orchestrator", orchestrator_node)
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("validator", validator_node)
    workflow.add_node("synthesizer", synthesizer_node)
    workflow.add_node("simple_response", simple_response_node)
    
    # Set entry point
    workflow.set_entry_point("orchestrator")
    
    # Add conditional edges from orchestrator
    workflow.add_conditional_edges(
        "orchestrator",
        should_research,
        {
            "researcher": "researcher",
            "simple_response": "simple_response"
        }
    )
    
    # Research flow: researcher -> validator -> synthesizer
    workflow.add_edge("researcher", "validator")
    workflow.add_edge("validator", "synthesizer")
    
    # End nodes
    workflow.add_edge("synthesizer", END)
    workflow.add_edge("simple_response", END)
    
    return workflow.compile()


async def run_workflow(
    workflow,
    user_query: str,
    session_id: str,
    query_id: str
) -> dict:
    """Run the workflow synchronously and return final state."""
    
    initial_state = {
        "user_query": user_query,
        "session_id": session_id,
        "query_id": query_id,
        "messages": [],
        "execution_plan": "",
        "needs_research": True,
        "research_results": [],
        "search_queries": [],
        "validated_facts": [],
        "conflicting_info": [],
        "final_response": "",
        "active_agent": "",
        "agent_history": []
    }
    
    result = await workflow.ainvoke(initial_state)
    return result


async def run_workflow_stream(
    workflow,
    user_query: str,
    session_id: str,
    query_id: str
) -> AsyncGenerator[dict, None]:
    """Run the workflow with streaming updates."""
    
    initial_state = {
        "user_query": user_query,
        "session_id": session_id,
        "query_id": query_id,
        "messages": [],
        "execution_plan": "",
        "needs_research": True,
        "research_results": [],
        "search_queries": [],
        "validated_facts": [],
        "conflicting_info": [],
        "final_response": "",
        "active_agent": "",
        "agent_history": []
    }
    
    # Track final state to save agent_history
    final_state = None
    
    # Stream through workflow nodes
    async for event in workflow.astream(initial_state):
        # Extract the node name and state update
        for node_name, state_update in event.items():
            yield {
                "type": "agent_update",
                "agent": node_name,
                "data": {
                    "active_agent": state_update.get("active_agent", node_name),
                    "agent_history": state_update.get("agent_history", []),
                    "execution_plan": state_update.get("execution_plan"),
                    "search_queries": state_update.get("search_queries"),
                    "research_results_count": len(state_update.get("research_results", [])) if state_update.get("research_results") else None,
                    "validated_facts_count": len(state_update.get("validated_facts", [])) if state_update.get("validated_facts") else None,
                }
            }
            
            # If this is the final response, stream it and save agent_history
            if state_update.get("final_response"):
                final_state = state_update
                yield {
                    "type": "final_response",
                    "content": state_update["final_response"]
                }
    
    # Save agent_history to session after workflow completes
    if final_state and final_state.get("agent_history"):
        db = get_db_client()
        agent_history = final_state.get("agent_history", [])
        db.save_agent_history_to_session(session_id, query_id, agent_history)

