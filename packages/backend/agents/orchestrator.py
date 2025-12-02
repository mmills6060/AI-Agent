from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from config.settings import settings
from db.mongodb import get_db_client


ORCHESTRATOR_SYSTEM_PROMPT = """You are the Orchestrator Agent in a multi-agent research system.
Your role is to analyze user queries and create an execution plan.

Your responsibilities:
1. Understand the user's intent and information needs
2. Determine if web research is needed (most queries will need it)
3. Break down complex queries into specific search queries for the Researcher agent
4. Create a clear execution plan

For each query, output a JSON response with:
{
    "needs_research": true/false,
    "search_queries": ["query1", "query2", ...],  // 1-3 specific search queries
    "execution_plan": "Brief description of how to answer this query"
}

Guidelines:
- For factual questions, current events, or anything requiring recent information: needs_research = true
- For simple greetings, math, or questions about yourself: needs_research = false
- Search queries should be specific and search-engine optimized
- Keep execution plans concise but actionable"""


class OrchestratorAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=0.3
        )
    
    async def process(self, state: dict) -> dict:
        """Analyze query and create execution plan."""
        user_query = state["user_query"]
        query_id = state.get("query_id", "")
        
        messages = [
            SystemMessage(content=ORCHESTRATOR_SYSTEM_PROMPT),
            HumanMessage(content=f"Analyze this query and create an execution plan:\n\n{user_query}")
        ]
        
        response = await self.llm.ainvoke(messages)
        response_text = response.content
        
        # Parse the JSON response
        import json
        try:
            # Extract JSON from the response
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                parsed = json.loads(response_text[json_start:json_end])
            else:
                parsed = {
                    "needs_research": True,
                    "search_queries": [user_query],
                    "execution_plan": "Perform general research on the query"
                }
        except json.JSONDecodeError:
            parsed = {
                "needs_research": True,
                "search_queries": [user_query],
                "execution_plan": "Perform general research on the query"
            }
        
        # Log to MongoDB
        db = get_db_client()
        db.log_agent_output(
            query_id=query_id,
            agent_name="orchestrator",
            output=response_text,
            metadata={
                "needs_research": parsed.get("needs_research", True),
                "search_queries": parsed.get("search_queries", []),
                "execution_plan": parsed.get("execution_plan", "")
            }
        )
        
        return {
            "execution_plan": parsed.get("execution_plan", ""),
            "needs_research": parsed.get("needs_research", True),
            "search_queries": parsed.get("search_queries", [user_query]),
            "active_agent": "orchestrator",
            "agent_history": state.get("agent_history", []) + [{
                "agent": "orchestrator",
                "action": "Created execution plan",
                "output": parsed
            }]
        }

