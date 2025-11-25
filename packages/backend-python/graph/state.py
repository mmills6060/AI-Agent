from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """State shared across all agents in the workflow."""
    
    # Original user query
    user_query: str
    
    # Session and query IDs for MongoDB logging
    session_id: str
    query_id: str
    
    # Conversation messages
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
    # Orchestrator output: execution plan
    execution_plan: str
    needs_research: bool
    
    # Researcher output: raw search results
    research_results: list[dict]
    search_queries: list[str]
    
    # Validator output: verified facts
    validated_facts: list[str]
    conflicting_info: list[str]
    
    # Synthesizer output: final response
    final_response: str
    
    # Agent activity tracking
    active_agent: str
    agent_history: list[dict]

