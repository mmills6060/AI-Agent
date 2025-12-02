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
        """
        Extract full content from URLs using Tavily extract API.
        
        Args:
            urls: List of URLs to extract content from (max 5)
            
        Returns:
            List of extracted content results
        """
        if not urls:
            return []
            
        try:
            response = self.tavily.extract(urls=urls[:5])
            return response.get("results", [])
        except Exception as e:
            return [{"error": str(e)}]
    
    async def crawl_website(self, url: str, instructions: str = None, max_pages: int = 10) -> dict:
        """
        Intelligently crawl a website based on instructions.
        
        Args:
            url: Starting URL to crawl
            instructions: Optional instructions for what to look for
            max_pages: Maximum number of pages to crawl (default: 10)
            
        Returns:
            Dictionary containing crawl results
        """
        if not url:
            return {"error": "URL is required"}
            
        try:
            params = {
                "url": url,
                "max_pages": max_pages
            }
            
            if instructions:
                params["instructions"] = instructions
                
            response = self.tavily.crawl(**params)
            return {
                "url": url,
                "pages_crawled": len(response.get("results", [])),
                "results": response.get("results", []),
                "metadata": response.get("metadata", {})
            }
        except Exception as e:
            return {
                "url": url,
                "error": str(e)
            }
    
    async def map_website(self, url: str) -> dict:
        """
        Create a structured map of a website's architecture.
        
        Args:
            url: Website URL to map
            
        Returns:
            Dictionary containing the site map structure
        """
        if not url:
            return {"error": "URL is required"}
            
        try:
            response = self.tavily.map(url=url)
            return {
                "url": url,
                "sitemap": response.get("sitemap", []),
                "total_pages": len(response.get("sitemap", [])),
                "metadata": response.get("metadata", {})
            }
        except Exception as e:
            return {
                "url": url,
                "error": str(e)
            }
    
    async def search_advanced(
        self, 
        query: str,
        search_depth: str = "advanced",
        max_results: int = 5,
        include_answer: bool = True,
        include_raw_content: bool = False,
        include_domains: list[str] = None,
        exclude_domains: list[str] = None
    ) -> dict:
        """
        Advanced search with additional parameters.
        
        Args:
            query: Search query string
            search_depth: "basic" or "advanced" (default: "advanced")
            max_results: Maximum number of results (default: 5)
            include_answer: Include AI-generated answer (default: True)
            include_raw_content: Include raw HTML content (default: False)
            include_domains: List of domains to include
            exclude_domains: List of domains to exclude
            
        Returns:
            Dictionary containing search results
        """
        if not query:
            return {"error": "Query is required"}
            
        try:
            params = {
                "query": query,
                "search_depth": search_depth,
                "max_results": max_results,
                "include_answer": include_answer,
                "include_raw_content": include_raw_content
            }
            
            if include_domains:
                params["include_domains"] = include_domains
                
            if exclude_domains:
                params["exclude_domains"] = exclude_domains
                
            response = self.tavily.search(**params)
            
            return {
                "query": query,
                "answer": response.get("answer", ""),
                "results": response.get("results", []),
                "images": response.get("images", []),
                "metadata": response.get("metadata", {})
            }
        except Exception as e:
            return {
                "query": query,
                "error": str(e)
            }

