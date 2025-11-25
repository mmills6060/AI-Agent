"use client"

import { useAgentStore } from "@/lib/agent-store"
import { cn } from "@/lib/utils"
import { 
  BrainCircuit, 
  Search, 
  CheckCircle2, 
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useState } from "react"
import { LazyMotion, domAnimation } from "motion/react"
import * as m from "motion/react-m"

const agentConfig: Record<string, { icon: typeof BrainCircuit; color: string; label: string }> = {
  orchestrator: { 
    icon: BrainCircuit, 
    color: "text-purple-400", 
    label: "Orchestrator" 
  },
  researcher: { 
    icon: Search, 
    color: "text-blue-400", 
    label: "Researcher" 
  },
  validator: { 
    icon: CheckCircle2, 
    color: "text-green-400", 
    label: "Validator" 
  },
  synthesizer: { 
    icon: FileText, 
    color: "text-amber-400", 
    label: "Synthesizer" 
  },
  simple_response: { 
    icon: FileText, 
    color: "text-amber-400", 
    label: "Response" 
  },
}

export function AgentActivityPanel() {
  const { activeAgent, agentHistory, isProcessing } = useAgentStore()
  const [isExpanded, setIsExpanded] = useState(true)

  if (agentHistory.length === 0 && !isProcessing) return null

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-24 right-4 z-50 w-80 rounded-lg border border-border bg-card shadow-lg overflow-hidden"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <BrainCircuit className="h-5 w-5 text-primary" />
              {isProcessing && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
            <span className="font-medium text-sm">Agent Activity</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {agentHistory.map((activity, index) => {
              const config = agentConfig[activity.agent] || agentConfig.orchestrator
              const Icon = config.icon
              const isActive = activeAgent === activity.agent && isProcessing && index === agentHistory.length - 1

              return (
                <m.div
                  key={`${activity.agent}-${activity.timestamp}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 rounded-md p-2 text-sm",
                    isActive ? "bg-muted" : "bg-transparent"
                  )}
                >
                  <div className={cn("mt-0.5", config.color)}>
                    {isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {config.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {activity.action}
                    </div>
                  </div>
                </m.div>
              )
            })}

            {isProcessing && agentHistory.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing query...</span>
              </div>
            )}
          </div>
        )}
      </m.div>
    </LazyMotion>
  )
}

