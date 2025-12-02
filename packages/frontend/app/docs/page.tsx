import Link from 'next/link'
import { DocsNav } from '@/components/docs/docs-nav'

const sections = [
  {
    title: 'Architecture',
    href: '/docs/architecture',
    description: 'System overview, technology stack, and communication flow between frontend, backend, and database.',
  },
  {
    title: 'Agent Roles',
    href: '/docs/agents',
    description: 'Detailed documentation of the four specialized agents: Orchestrator, Researcher, Validator, and Synthesizer.',
  },
  {
    title: 'LangGraph Flow',
    href: '/docs/langgraph',
    description: 'State management, workflow graph, conditional routing, and streaming mechanism.',
  },
  {
    title: 'Database Schema',
    href: '/docs/database',
    description: 'MongoDB collections structure including sessions, queries, and agent outputs.',
  },
  {
    title: 'Deployment',
    href: '/docs/deployment',
    description: 'AWS ECS Fargate infrastructure, CI/CD pipeline, and deployment commands.',
  },
]

export default function Docs() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DocsNav />
          
          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Technical Documentation</h1>
            <p className="text-muted-foreground text-lg mb-12">
              Comprehensive documentation covering the architecture, agents, workflow, database, and deployment of the AI Agent system.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group block bg-muted/30 hover:bg-muted/50 border border-border rounded-lg p-6 transition-all hover:border-primary/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {section.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
