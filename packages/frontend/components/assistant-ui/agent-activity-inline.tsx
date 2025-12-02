import {
  Brain,
  Search,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  ChevronDownIcon,
} from "lucide-react"
import { useState, type FC } from "react"
import * as m from "motion/react-m"
import { useAgentStore } from "@/lib/agent-store"
import { cn } from "@/lib/utils"

const agentConfig: Record<string, { icon: typeof Brain; color: string; bgColor: string; label: string }> = {
  orchestrator: { 
    icon: Brain, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Planning" 
  },
  researcher: { 
    icon: Search, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Researching" 
  },
  validator: { 
    icon: CheckCircle2, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Validating" 
  },
  synthesizer: { 
    icon: FileText, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Synthesizing" 
  },
  simple_response: { 
    icon: Sparkles, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Responding" 
  },
}

const formatAgentOutput = (output: string | Record<string, unknown>): string => {
  if (typeof output === "string") return output
  return JSON.stringify(output, null, 2)
}

export const AgentActivityInline: FC = () => {
  const { agentHistory, isProcessing, activeAgent } = useAgentStore()
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)

  // Show when running OR when we have history from the current/recent response
  if (agentHistory.length === 0 && !isProcessing) return null

  const isComplete = !isProcessing && agentHistory.length > 0

  const toggleExpanded = (key: string) => {
    setExpandedAgent(prev => prev === key ? null : key)
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 mx-2"
    >
      {/* Vertical timeline container */}
      <div className="flex flex-col gap-0">
        {agentHistory.map((activity, index) => {
          const config = agentConfig[activity.agent] || agentConfig.orchestrator
          const Icon = config.icon
          const isActive = activeAgent === activity.agent && isProcessing && index === agentHistory.length - 1
          const isLastStep = index === agentHistory.length - 1
          const activityKey = `${activity.agent}-${activity.timestamp}`
          const isExpanded = expandedAgent === activityKey
          const hasOutput = activity.output && (
            typeof activity.output === "string" 
              ? activity.output.trim().length > 0 
              : Object.keys(activity.output).length > 0
          )

          return (
            <m.div
              key={activityKey}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 400, damping: 25 }}
              className="flex flex-col"
            >
              {/* Agent step row */}
              <div className="flex items-stretch">
                {/* Vertical line and dot indicator */}
                <div className="flex flex-col items-center mr-3 w-5">
                  {/* Top connector line */}
                  {index > 0 && (
                    <div className={cn(
                      "w-0.5 h-2 -mt-0",
                      isComplete ? config.bgColor : "bg-border"
                    )} />
                  )}
                  {/* Dot indicator */}
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full shrink-0",
                    isActive 
                      ? cn(config.bgColor, "ring-2 ring-offset-1 ring-offset-background", config.color.replace("text-", "ring-"))
                      : config.bgColor
                  )}>
                    {isActive ? (
                      <Loader2 className={cn("h-3 w-3 animate-spin", config.color)} />
                    ) : (
                      <Icon className={cn("h-3 w-3", config.color)} />
                    )}
                  </div>
                  {/* Bottom connector line */}
                  {!isLastStep && (
                    <div className={cn(
                      "w-0.5 flex-1 min-h-2",
                      isComplete ? config.bgColor : "bg-border"
                    )} />
                  )}
                </div>

                {/* Agent step content */}
                <div className="flex-1 pb-3">
                  <button
                    onClick={() => hasOutput && toggleExpanded(activityKey)}
                    disabled={!hasOutput}
                    className={cn(
                      "w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all",
                      hasOutput && "cursor-pointer hover:bg-accent/50",
                      !hasOutput && "cursor-default",
                      isExpanded && "bg-accent/30",
                      isActive && cn(config.bgColor, "ring-1 ring-inset", config.color.replace("text-", "ring-").replace("-400", "-500/30"))
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isActive || isComplete ? config.color : "text-muted-foreground"
                      )}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground/70 truncate max-w-[200px]">
                        {activity.action}
                      </span>
                    </div>
                    {hasOutput && (
                      <ChevronDownIcon 
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    )}
                  </button>

                  {/* Expanded output content */}
                  {isExpanded && hasOutput && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 ml-1"
                    >
                      <div className={cn(
                        "rounded-lg border p-3 text-sm",
                        config.bgColor,
                        "border-current/10"
                      )}>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current/10">
                          <Icon className={cn("h-4 w-4", config.color)} />
                          <span className={cn("text-xs font-semibold uppercase tracking-wider", config.color)}>
                            {config.label} Output
                          </span>
                        </div>
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
                          {formatAgentOutput(activity.output)}
                        </pre>
                      </div>
                    </m.div>
                  )}
                </div>
              </div>
            </m.div>
          )
        })}

      </div>
    </m.div>
  )
}
