import Link from 'next/link'
import { DocsNav } from '@/components/docs/docs-nav'

export default function Agents() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DocsNav />
          
          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Agent Roles</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            The system uses four specialized agents that collaborate to answer user queries. Each agent has a specific role and responsibility in the workflow.
          </p>

          <div className="space-y-6">
            {/* Orchestrator Agent */}
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-3 flex items-center">
                Orchestrator Agent
              </h2>
              <p className="text-muted-foreground mb-4">
                The entry point that analyzes incoming queries and creates execution plans.
              </p>
              <div className="space-y-2">
                <div className="font-semibold text-sm">Responsibilities:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Analyzes user query intent and complexity</li>
                  <li>Determines if web research is needed</li>
                  <li>Breaks down complex queries into search queries</li>
                  <li>Creates execution plan for downstream agents</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-semibold text-sm mb-2">Output:</div>
                  <div className="bg-background/50 p-3 rounded text-xs font-mono">
                    <code className="text-muted-foreground">
                      needs_research: boolean<br/>
                      search_queries: string[]<br/>
                      execution_plan: string
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Researcher Agent */}
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-3 flex items-center">
                Researcher Agent
              </h2>
              <p className="text-muted-foreground mb-4">
                Performs real-time web searches using the Tavily API to gather information.
              </p>
              <div className="space-y-2">
                <div className="font-semibold text-sm">Responsibilities:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Executes search queries via Tavily API</li>
                  <li>Retrieves up to 5 results per query</li>
                  <li>Extracts titles, URLs, content, and relevance scores</li>
                  <li>Handles up to 3 search queries per request</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-semibold text-sm mb-2">Configuration:</div>
                  <div className="bg-background/50 p-3 rounded text-xs font-mono">
                    <code className="text-muted-foreground">
                      search_depth: "advanced"<br/>
                      max_results: 5<br/>
                      include_answer: true<br/>
                      include_raw_content: false
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Validator Agent */}
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-3 flex items-center">
                Validator Agent
              </h2>
              <p className="text-muted-foreground mb-4">
                Verifies information accuracy and identifies conflicting data across sources.
              </p>
              <div className="space-y-2">
                <div className="font-semibold text-sm">Responsibilities:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Cross-references information from multiple sources</li>
                  <li>Identifies conflicting or contradictory data</li>
                  <li>Validates facts against search results</li>
                  <li>Flags uncertain or unverifiable information</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-semibold text-sm mb-2">Output:</div>
                  <div className="bg-background/50 p-3 rounded text-xs font-mono">
                    <code className="text-muted-foreground">
                      validated_facts: string[]<br/>
                      conflicting_info: string[]
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Synthesizer Agent */}
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-3 flex items-center">
                Synthesizer Agent
              </h2>
              <p className="text-muted-foreground mb-4">
                Generates the final response with proper citations and formatting.
              </p>
              <div className="space-y-2">
                <div className="font-semibold text-sm">Responsibilities:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Combines validated information into coherent response</li>
                  <li>Includes inline citations with source URLs</li>
                  <li>Formats response in Markdown</li>
                  <li>Handles both research-based and simple responses</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-semibold text-sm mb-2">Output:</div>
                  <div className="bg-background/50 p-3 rounded text-xs font-mono">
                    <code className="text-muted-foreground">
                      final_response: string (Markdown formatted)
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <Link
              href="/docs/architecture"
              className="inline-flex items-center text-muted-foreground hover:text-primary"
            >
              ← Previous: Architecture
            </Link>
            <Link
              href="/docs/langgraph"
              className="inline-flex items-center text-primary hover:underline"
            >
              Next: LangGraph Flow →
            </Link>
          </div>
        </div>
          </main>
        </div>
      </div>
    </div>
  )
}

