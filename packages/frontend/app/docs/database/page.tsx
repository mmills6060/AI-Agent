import Link from 'next/link'
import { DocsNav } from '@/components/docs/docs-nav'

export default function Database() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DocsNav />
          
          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Database Schema</h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                MongoDB Atlas stores conversation history, queries, and agent execution details across three collections.
              </p>

              <div className="space-y-6">
                {/* Sessions Collection */}
                <div className="bg-muted/30 p-6 rounded-lg border border-border">
                  <h2 className="text-2xl font-semibold mb-3 flex items-center">
                    sessions
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Stores conversation threads with messages and agent execution history.
                  </p>
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">{`{
  "_id": ObjectId,
  "created_at": DateTime,
  "messages": [
    {
      "role": "user" | "assistant",
      "content": string,
      "timestamp": DateTime
    }
  ],
  "agent_history": {
    "<query_id>": [
      {
        "agent": string,
        "action": string,
        "output": any
      }
    ]
  }
}`}</pre>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-sm mb-2">Used For:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Thread list and conversation history</li>
                      <li>Agent activity panel display</li>
                      <li>Export functionality (JSON/CSV)</li>
                    </ul>
                  </div>
                </div>

                {/* Queries Collection */}
                <div className="bg-muted/30 p-6 rounded-lg border border-border">
                  <h2 className="text-2xl font-semibold mb-3 flex items-center">
                    queries
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Logs each user query with timestamp and session reference.
                  </p>
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">{`{
  "_id": ObjectId,
  "user_query": string,
  "session_id": string | null,
  "timestamp": DateTime
}`}</pre>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-sm mb-2">Used For:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Query analytics and tracking</li>
                      <li>Linking queries to agent outputs</li>
                      <li>Historical query retrieval</li>
                    </ul>
                  </div>
                </div>

                {/* Agent Outputs Collection */}
                <div className="bg-muted/30 p-6 rounded-lg border border-border">
                  <h2 className="text-2xl font-semibold mb-3 flex items-center">
                    agent_outputs
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Records individual agent execution outputs with metadata.
                  </p>
                  <div className="bg-background/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">{`{
  "_id": ObjectId,
  "query_id": string,
  "agent_name": "orchestrator" | "researcher" | "validator" | "synthesizer",
  "output": string,
  "metadata": {
    // Agent-specific metadata
    // Orchestrator: needs_research, search_queries, execution_plan
    // Researcher: search_queries, results_count
    // Validator: validated_facts_count, conflicts_count
    // Synthesizer: response_length, sources_count
  },
  "timestamp": DateTime
}`}</pre>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-sm mb-2">Used For:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Debugging agent behavior</li>
                      <li>Performance monitoring</li>
                      <li>Audit trail of agent decisions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 mt-12">Relationships</h2>
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre className="text-foreground">
{`sessions._id ←→ queries.session_id (one-to-many)
queries._id  ←→ agent_outputs.query_id (one-to-many)
sessions.agent_history.<query_id> ←→ queries._id (embedded)`}
                </pre>
              </div>

              <div className="mt-12 flex gap-4">
                <Link
                  href="/docs/langgraph"
                  className="inline-flex items-center text-muted-foreground hover:text-primary"
                >
                  ← Previous: LangGraph Flow
                </Link>
                <Link
                  href="/docs/deployment"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Next: Deployment →
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

