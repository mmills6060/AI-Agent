from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from config.settings import settings
from db.mongodb import get_db_client


SYNTHESIZER_SYSTEM_PROMPT = """You are the Synthesizer Agent in a multi-agent research system.
Your role is to combine validated research findings into a clear, coherent response.

Your responsibilities:
1. Create a comprehensive yet concise response to the user's query
2. Incorporate validated facts from research
3. Note any conflicting information transparently
4. Cite sources where appropriate
5. Structure the response for readability

Guidelines:
- Be informative and helpful
- Use clear, accessible language
- If there are conflicts in the data, mention them honestly
- Include relevant source URLs when citing specific facts
- Format with markdown for readability (headers, lists, etc.)
- If research was limited or inconclusive, acknowledge this"""


class SynthesizerAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=0.7,
            streaming=True
        )
    
    async def process(self, state: dict) -> dict:
        """Synthesize research into final response."""
        user_query = state.get("user_query", "")
        query_id = state.get("query_id", "")
        research_results = state.get("research_results", [])
        validated_facts = state.get("validated_facts", [])
        conflicting_info = state.get("conflicting_info", [])
        
        # Build context for synthesis
        context = self._build_context(research_results, validated_facts, conflicting_info)
        
        messages = [
            SystemMessage(content=SYNTHESIZER_SYSTEM_PROMPT),
            HumanMessage(content=f"""User Query: {user_query}

{context}

Please synthesize this information into a helpful, well-structured response for the user.""")
        ]
        
        response = await self.llm.ainvoke(messages)
        final_response = response.content
        
        # Log to MongoDB
        db = get_db_client()
        db.log_agent_output(
            query_id=query_id,
            agent_name="synthesizer",
            output=final_response,
            metadata={
                "sources_used": len(research_results),
                "facts_incorporated": len(validated_facts)
            }
        )
        
        # Add assistant message to session
        session_id = state.get("session_id")
        if session_id:
            db.add_message_to_session(session_id, "assistant", final_response)
        
        return {
            "final_response": final_response,
            "active_agent": "synthesizer",
            "agent_history": state.get("agent_history", []) + [{
                "agent": "synthesizer",
                "action": "Generated final response",
                "output": f"Response length: {len(final_response)} chars"
            }]
        }
    
    async def process_stream(self, state: dict):
        """Synthesize research into final response with streaming."""
        user_query = state.get("user_query", "")
        query_id = state.get("query_id", "")
        research_results = state.get("research_results", [])
        validated_facts = state.get("validated_facts", [])
        conflicting_info = state.get("conflicting_info", [])
        
        context = self._build_context(research_results, validated_facts, conflicting_info)
        
        messages = [
            SystemMessage(content=SYNTHESIZER_SYSTEM_PROMPT),
            HumanMessage(content=f"""User Query: {user_query}

{context}

Please synthesize this information into a helpful, well-structured response for the user.""")
        ]
        
        full_response = ""
        async for chunk in self.llm.astream(messages):
            if chunk.content:
                full_response += chunk.content
                yield chunk.content
        
        # Log final response
        db = get_db_client()
        db.log_agent_output(
            query_id=query_id,
            agent_name="synthesizer",
            output=full_response,
            metadata={
                "sources_used": len(research_results),
                "facts_incorporated": len(validated_facts)
            }
        )
        
        session_id = state.get("session_id")
        if session_id:
            db.add_message_to_session(session_id, "assistant", full_response)
    
    async def process_simple(self, state: dict) -> dict:
        """Handle simple queries that don't need research."""
        user_query = state.get("user_query", "")
        query_id = state.get("query_id", "")
        
        messages = [
            SystemMessage(content="You are a helpful AI assistant. Respond naturally and helpfully to the user's message."),
            HumanMessage(content=user_query)
        ]
        
        response = await self.llm.ainvoke(messages)
        final_response = response.content
        
        db = get_db_client()
        db.log_agent_output(
            query_id=query_id,
            agent_name="synthesizer",
            output=final_response,
            metadata={"type": "simple_response"}
        )
        
        session_id = state.get("session_id")
        if session_id:
            db.add_message_to_session(session_id, "assistant", final_response)
        
        return {
            "final_response": final_response,
            "active_agent": "synthesizer",
            "agent_history": state.get("agent_history", []) + [{
                "agent": "synthesizer",
                "action": "Generated simple response (no research needed)",
                "output": f"Response length: {len(final_response)} chars"
            }]
        }
    
    def _build_context(
        self,
        research_results: list,
        validated_facts: list,
        conflicting_info: list
    ) -> str:
        """Build context string from research data."""
        parts = []
        
        # Add validated facts
        if validated_facts:
            parts.append("## Validated Facts")
            for fact in validated_facts:
                parts.append(f"- {fact}")
        
        # Add conflicting info
        if conflicting_info:
            parts.append("\n## Conflicting Information (handle with care)")
            for conflict in conflicting_info:
                parts.append(f"- {conflict}")
        
        # Add raw research for reference
        if research_results:
            parts.append("\n## Research Sources")
            for result in research_results:
                if result.get("answer"):
                    parts.append(f"\nTavily Summary for '{result.get('query', '')}': {result['answer']}")
                for source in result.get("sources", [])[:3]:
                    parts.append(f"- [{source.get('title', 'Source')}]({source.get('url', '')})")
        
        return "\n".join(parts) if parts else "No research data available."

