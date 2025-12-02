'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { id: 'architecture', title: 'Architecture', href: '/docs/architecture' },
  { id: 'agents', title: 'Agent Roles', href: '/docs/agents' },
  { id: 'langgraph', title: 'LangGraph Flow', href: '/docs/langgraph' },
  { id: 'database', title: 'Database Schema', href: '/docs/database' },
  { id: 'deployment', title: 'Deployment', href: '/docs/deployment' },
]

export function DocsNav() {
  const pathname = usePathname()

  return (
    <aside className="lg:col-span-1">
      <nav className="sticky top-20 space-y-1">
        <Link
          href="/docs"
          className="block text-sm font-semibold text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          ← Documentation Home
        </Link>
        <div className="text-sm font-semibold text-muted-foreground mb-4">
          Contents
        </div>
        {sections.map((section) => {
          const isActive = pathname === section.href
          return (
            <Link
              key={section.id}
              href={section.href}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {section.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

