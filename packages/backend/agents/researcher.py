from tavily import TavilyClient
from config.settings import settings
from db.mongodb import get_db_client


class ResearcherAgent:
    def __init__(self):
        self.tavily = TavilyClient(api_key=settings.tavily_api_key)
    
    async def process(self, state: dict) -> dict:
        """Perform web research using Tavily API."""
        search_queries = state.get("search_queries", [])
        query_id = state.get("query_id", "")
        
        if not search_queries:
            search_queries = [state["user_query"]]
        
        all_results = []
        
        for query in search_queries[:3]:  # Limit to 3 queries
            try:
                # Use Tavily search API
                response = self.tavily.search(
                    query=query,
                    search_depth="advanced",
                    max_results=5,
                    include_answer=True,
                    include_raw_content=False
                )
                
                results = {
                    "query": query,
                    "answer": response.get("answer", ""),
                    "sources": []
                }
                
                for result in response.get("results", []):
                    results["sources"].append({
                        "title": result.get("title", ""),
                        "url": result.get("url", ""),
                        "content": result.get("content", ""),
                        "score": result.get("score", 0)
                    })
                
                all_results.append(results)
                
            except Exception as e:
                all_results.append({
                    "query": query,
                    "error": str(e),
                    "sources": []
                })
        
        # Log to MongoDB
        db = get_db_client()
        db.log_agent_output(
            query_id=query_id,
            agent_name="researcher",
            output=str(all_results),
            metadata={
                "search_queries": search_queries,
                "results_count": sum(len(r.get("sources", [])) for r in all_results)
            }
        )
        
        return {
            "research_results": all_results,
            "active_agent": "researcher",
            "agent_history": state.get("agent_history", []) + [{
                "agent": "researcher",
                "action": f"Searched {len(search_queries)} queries",
                "output": f"Found {sum(len(r.get('sources', [])) for r in all_results)} sources"
            }]
        }
    
    async def extract_content(self, urls: list[str]) -> list[dict]:
        """Extract full content from URLs using Tavily extract API."""
        try:
            response = self.tavily.extract(urls=urls[:5])
            return response.get("results", [])
        except Exception as e:
            return [{"error": str(e)}]

