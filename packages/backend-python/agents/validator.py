from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from config.settings import settings
from db.mongodb import get_db_client
import json


VALIDATOR_SYSTEM_PROMPT = """You are the Validator Agent in a multi-agent research system.
Your role is to fact-check and verify information from research results.

Your responsibilities:
1. Review the research results for accuracy and consistency
2. Identify any conflicting information between sources
3. Extract verified facts that are well-supported by multiple sources
4. Flag uncertain or potentially unreliable claims

Output a JSON response with:
{
    "validated_facts": ["fact1", "fact2", ...],  // Well-supported facts
    "conflicting_info": ["conflict1", ...],  // Contradictions found
    "reliability_assessment": "high/medium/low",
    "notes": "Any additional observations"
}

Guidelines:
- Prioritize facts mentioned by multiple reliable sources
- Note when sources disagree
- Be skeptical of unsourced claims
- Consider source credibility based on URL domains"""


class ValidatorAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=0.2
        )
    
    async def process(self, state: dict) -> dict:
        """Validate and fact-check research results."""
        research_results = state.get("research_results", [])
        query_id = state.get("query_id", "")
        user_query = state.get("user_query", "")
        
        # Format research results for validation
        research_summary = self._format_research_for_validation(research_results)
        
        messages = [
            SystemMessage(content=VALIDATOR_SYSTEM_PROMPT),
            HumanMessage(content=f"""Original Query: {user_query}

Research Results to Validate:
{research_summary}

Please validate these research findings and identify verified facts vs conflicting information.""")
        ]
        
        response = await self.llm.ainvoke(messages)
        response_text = response.content
        
        # Parse the JSON response
        try:
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                parsed = json.loads(response_text[json_start:json_end])
            else:
                parsed = self._default_validation()
        except json.JSONDecodeError:
            parsed = self._default_validation()
        
        # Log to MongoDB
        db = get_db_client()
        db.log_agent_output(
            query_id=query_id,
            agent_name="validator",
            output=response_text,
            metadata={
                "validated_facts_count": len(parsed.get("validated_facts", [])),
                "conflicts_count": len(parsed.get("conflicting_info", [])),
                "reliability": parsed.get("reliability_assessment", "medium")
            }
        )
        
        return {
            "validated_facts": parsed.get("validated_facts", []),
            "conflicting_info": parsed.get("conflicting_info", []),
            "active_agent": "validator",
            "agent_history": state.get("agent_history", []) + [{
                "agent": "validator",
                "action": "Validated research findings",
                "output": {
                    "facts_verified": len(parsed.get("validated_facts", [])),
                    "conflicts_found": len(parsed.get("conflicting_info", [])),
                    "reliability": parsed.get("reliability_assessment", "medium")
                }
            }]
        }
    
    def _format_research_for_validation(self, research_results: list) -> str:
        """Format research results into a readable summary."""
        formatted = []
        for i, result in enumerate(research_results, 1):
            formatted.append(f"\n--- Research Set {i}: Query '{result.get('query', 'Unknown')}' ---")
            
            if result.get("answer"):
                formatted.append(f"Summary Answer: {result['answer']}")
            
            for j, source in enumerate(result.get("sources", []), 1):
                formatted.append(f"\nSource {j}: {source.get('title', 'Untitled')}")
                formatted.append(f"URL: {source.get('url', 'N/A')}")
                formatted.append(f"Content: {source.get('content', 'No content')[:500]}...")
        
        return "\n".join(formatted)
    
    def _default_validation(self) -> dict:
        return {
            "validated_facts": [],
            "conflicting_info": [],
            "reliability_assessment": "medium",
            "notes": "Unable to parse validation results"
        }

