import Link from 'next/link'
import { DocsNav } from '@/components/docs/docs-nav'

export default function LangGraph() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DocsNav />
          
          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold tracking-tight mb-8">LangGraph Flow</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            LangGraph orchestrates the multi-agent workflow with a state machine that manages information flow between agents.
          </p>

          <h2 className="text-3xl font-bold mb-6 mt-12">Agent State Schema</h2>
          <p className="text-muted-foreground mb-4">
            The <code className="text-sm bg-muted px-1.5 py-0.5 rounded">AgentState</code> is shared across all agents and contains all workflow data:
          </p>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto mb-6">
            <pre className="text-foreground">{`interface AgentState {
  // Original user query
  user_query: string
  
  // Database identifiers
  session_id: string
  query_id: string
  
  // Conversation messages
  messages: BaseMessage[]
  
  // Orchestrator output
  execution_plan: string
  needs_research: boolean
  
  // Researcher output
  research_results: Array<{
    query: string
    answer: string
    sources: Array<{
      title: string
      url: string
      content: string
      score: number
    }>
  }>
  search_queries: string[]
  
  // Validator output
  validated_facts: string[]
  conflicting_info: string[]
  
  // Synthesizer output
  final_response: string
  
  // Activity tracking
  active_agent: string
  agent_history: Array<{
    agent: string
    action: string
    output: any
  }>
}`}</pre>
          </div>

          <h2 className="text-3xl font-bold mb-6 mt-12">Workflow Graph</h2>
          <p className="text-muted-foreground mb-4">
            The workflow uses conditional routing based on the <code className="text-sm bg-muted px-1.5 py-0.5 rounded">needs_research</code> flag:
          </p>
          <div className="bg-muted/50 p-6 rounded-lg font-mono text-xs overflow-x-auto mb-6">
            <pre className="text-foreground">
{`                    ┌─────────────────┐
                    │  Orchestrator   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
          needs_research=true   needs_research=false
                    │                 │
                    ▼                 ▼
            ┌──────────────┐   ┌──────────────────┐
            │  Researcher  │   │ Simple Response  │
            └──────┬───────┘   └────────┬─────────┘
                   │                    │
                   ▼                    │
            ┌──────────────┐            │
            │  Validator   │            │
            └──────┬───────┘            │
                   │                    │
                   ▼                    │
            ┌──────────────┐            │
            │ Synthesizer  │◄───────────┘
            └──────┬───────┘
                   │
                   ▼
                 [END]`}
            </pre>
          </div>

          <h2 className="text-3xl font-bold mb-6 mt-12">Execution Paths</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <div className="font-semibold mb-2">Research Path</div>
              <p className="text-sm text-muted-foreground">
                For queries requiring real-time information:
              </p>
              <div className="mt-2 text-sm font-mono text-muted-foreground">
                Orchestrator → Researcher → Validator → Synthesizer → END
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <div className="font-semibold mb-2">Simple Response Path</div>
              <p className="text-sm text-muted-foreground">
                For greetings, math, or general knowledge:
              </p>
              <div className="mt-2 text-sm font-mono text-muted-foreground">
                Orchestrator → Simple Response → END
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6 mt-12">Streaming Mechanism</h2>
          <p className="text-muted-foreground mb-4">
            The workflow streams updates in real-time via Server-Sent Events:
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start">
              <span className="text-primary mr-2">1.</span>
              <span>Workflow streams each node execution via <code className="bg-muted px-1.5 py-0.5 rounded">workflow.astream()</code></span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">2.</span>
              <span>Backend sends <code className="bg-muted px-1.5 py-0.5 rounded">agent_update</code> events with current agent and state</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">3.</span>
              <span>Frontend displays active agent and updates activity panel</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">4.</span>
              <span>Final response is sent as <code className="bg-muted px-1.5 py-0.5 rounded">final_response</code> event</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">5.</span>
              <span>Agent history is saved to session for export functionality</span>
            </li>
          </ul>

          <div className="mt-12 flex gap-4">
            <Link
              href="/docs/agents"
              className="inline-flex items-center text-muted-foreground hover:text-primary"
            >
              ← Previous: Agent Roles
            </Link>
            <Link
              href="/docs/database"
              className="inline-flex items-center text-primary hover:underline"
            >
              Next: Database Schema →
            </Link>
          </div>
        </div>
          </main>
        </div>
      </div>
    </div>
  )
}

