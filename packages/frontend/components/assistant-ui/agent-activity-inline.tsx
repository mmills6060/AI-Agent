"use client"

import { useAgentStore } from "@/lib/agent-store"
import { cn } from "@/lib/utils"
import { 
  BrainCircuit, 
  Search, 
  CheckCircle2, 
  FileText,
  Loader2
} from "lucide-react"
import { LazyMotion, domAnimation } from "motion/react"
import * as m from "motion/react-m"

const agentConfig: Record<string, { icon: typeof BrainCircuit; color: string; completedColor: string; bgColor: string; label: string }> = {
  orchestrator: { 
    icon: BrainCircuit, 
    color: "text-purple-400", 
    completedColor: "text-purple-400/70",
    bgColor: "bg-purple-500/10",
    label: "Orchestrator"
  },
  researcher: { 
    icon: Search, 
    color: "text-blue-400",
    completedColor: "text-blue-400/70",
    bgColor: "bg-blue-500/10", 
    label: "Researcher"
  },
  validator: { 
    icon: CheckCircle2, 
    color: "text-emerald-400",
    completedColor: "text-emerald-400/70",
    bgColor: "bg-emerald-500/10", 
    label: "Validator"
  },
  synthesizer: { 
    icon: FileText, 
    color: "text-amber-400",
    completedColor: "text-amber-400/70",
    bgColor: "bg-amber-500/10", 
    label: "Synthesizer"
  },
  simple_response: { 
    icon: FileText, 
    color: "text-amber-400",
    completedColor: "text-amber-400/70",
    bgColor: "bg-amber-500/10", 
    label: "Response"
  },
}

export function AgentActivityInline() {
  const { agentHistory, isProcessing } = useAgentStore()

  if (agentHistory.length === 0 && !isProcessing) return null

  const allCompleted = !isProcessing && agentHistory.length > 0

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-[var(--thread-max-width)] py-3"
      >
        <div className={cn(
          "flex flex-col gap-1 rounded-xl border border-border/50 bg-muted/30 p-3 transition-all duration-300",
          allCompleted && "bg-muted/20"
        )}>
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              isProcessing ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
            )} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {isProcessing ? "Processing" : "Completed"}
            </span>
          </div>

          {agentHistory.map((activity, index) => {
            const config = agentConfig[activity.agent] || agentConfig.orchestrator
            const Icon = config.icon
            const isActive = isProcessing && index === agentHistory.length - 1
            const isCompleted = !isActive

            return (
              <m.div
                key={`${activity.agent}-${activity.timestamp}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-all duration-200",
                  isActive && config.bgColor
                )}
              >
                <div className={cn(
                  "flex items-center justify-center rounded-md p-1 transition-colors",
                  isActive ? config.bgColor : "bg-background/50"
                )}>
                  {isActive ? (
                    <Loader2 className={cn("h-3.5 w-3.5 animate-spin", config.color)} />
                  ) : (
                    <Icon className={cn("h-3.5 w-3.5", config.completedColor)} />
                  )}
                </div>
                
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={cn(
                    "font-medium text-xs",
                    isActive ? config.color : config.completedColor
                  )}>
                    {config.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60 truncate">
                    {activity.action}
                  </span>
                </div>

                {isCompleted && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60 shrink-0" />
                )}
              </m.div>
            )
          })}

          {isProcessing && agentHistory.length === 0 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-2 py-1.5"
            >
              <div className="flex items-center justify-center rounded-md p-1 bg-background/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">
                Initializing agents...
              </span>
            </m.div>
          )}
        </div>
      </m.div>
    </LazyMotion>
  )
}

