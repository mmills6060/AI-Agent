import Link from 'next/link'
import { DocsNav } from '@/components/docs/docs-nav'

export default function Architecture() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DocsNav />
          
          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Architecture</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            The AI Agent is a multi-agent research system that uses LangGraph to coordinate specialized agents for answering complex queries with real-time web research.
          </p>

          <h2 className="text-3xl font-bold mb-6 mt-12">System Overview</h2>
          <div className="bg-muted/50 p-6 rounded-lg font-mono text-xs overflow-x-auto mb-6">
            <pre className="text-foreground">
{`┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────────────────────────┐   │
│  │ Thread List │  │  Chat Interface │  │  Agent Activity Panel          │   │
│  └─────────────┘  └─────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              REST API + SSE
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI + LangGraph)                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          LangGraph Workflow                            │  │
│  │                                                                        │  │
│  │   ┌────────────┐    ┌────────────┐    ┌───────────┐    ┌───────────┐  │  │
│  │   │Orchestrator│───▶│ Researcher │───▶│ Validator │───▶│Synthesizer│  │  │
│  │   └────────────┘    └────────────┘    └───────────┘    └───────────┘  │  │
│  │         │                  │                                          │  │
│  │         │                  │                                          │  │
│  │         ▼                  ▼                                          │  │
│  │    OpenAI API         Tavily API                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MongoDB Atlas                                     │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────────────────────────┐   │
│  │  sessions   │  │     queries     │  │        agent_outputs           │   │
│  └─────────────┘  └─────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          <h2 className="text-3xl font-bold mb-6 mt-12">Technology Stack</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Layer</th>
                  <th className="text-left py-3 px-4 font-semibold">Technology</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Frontend</td>
                  <td className="py-3 px-4">Next.js 15, React 19, TailwindCSS, assistant-ui</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Backend</td>
                  <td className="py-3 px-4">Python 3.11+, FastAPI, LangGraph, LangChain</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">LLM</td>
                  <td className="py-3 px-4">OpenAI GPT-4o-mini</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Web Search</td>
                  <td className="py-3 px-4">Tavily API</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Database</td>
                  <td className="py-3 px-4">MongoDB Atlas</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">Deployment</td>
                  <td className="py-3 px-4">AWS ECS Fargate, ECR, ALB</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-3xl font-bold mb-6 mt-12">Communication Flow</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>Frontend sends user messages via REST API to <code className="text-sm bg-muted px-1.5 py-0.5 rounded">/api/chat</code></span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>Backend streams agent updates via Server-Sent Events (SSE)</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>Frontend receives real-time updates for each agent execution</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>Final response is streamed back with source citations</span>
            </li>
          </ul>

          <div className="mt-12 flex gap-4">
            <Link
              href="/docs/agents"
              className="inline-flex items-center text-primary hover:underline"
            >
              Next: Agent Roles →
            </Link>
          </div>
        </div>
          </main>
        </div>
      </div>
    </div>
  )
}

