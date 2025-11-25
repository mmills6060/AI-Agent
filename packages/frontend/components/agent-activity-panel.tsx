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
  ChevronUp,
  Sparkles
} from "lucide-react"
import { useState, useEffect } from "react"
import { LazyMotion, domAnimation } from "motion/react"
import * as m from "motion/react-m"

const agentConfig: Record<string, { icon: typeof BrainCircuit; color: string; bgColor: string; label: string; description: string }> = {
  orchestrator: { 
    icon: BrainCircuit, 
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/30",
    label: "Orchestrator",
    description: "Planning research strategy"
  },
  researcher: { 
    icon: Search, 
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    label: "Researcher",
    description: "Searching the web"
  },
  validator: { 
    icon: CheckCircle2, 
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/30",
    label: "Validator",
    description: "Verifying information"
  },
  synthesizer: { 
    icon: FileText, 
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/30",
    label: "Synthesizer",
    description: "Composing response"
  },
  simple_response: { 
    icon: Sparkles, 
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10 border-cyan-500/30",
    label: "Quick Response",
    description: "Generating response"
  },
}

export function AgentActivityPanel() {
  const { activeAgent, agentHistory, isProcessing } = useAgentStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showPanel, setShowPanel] = useState(false)

  // Show panel when processing starts or has history
  useEffect(() => {
    if (isProcessing || agentHistory.length > 0) {
      setShowPanel(true)
    }
  }, [isProcessing, agentHistory.length])

  // Auto-hide after completion with delay
  useEffect(() => {
    if (!isProcessing && agentHistory.length > 0) {
      const timer = setTimeout(() => {
        setShowPanel(false)
      }, 8000) // Hide 8 seconds after completion
      return () => clearTimeout(timer)
    }
  }, [isProcessing, agentHistory.length])

  if (!showPanel) return null

  const currentConfig = activeAgent ? agentConfig[activeAgent] : null

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed bottom-28 right-6 z-50 w-[340px] rounded-xl border border-border/50 bg-card/95 backdrop-blur-lg shadow-2xl overflow-hidden"
      >
        {/* Header with current agent status */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-muted/80 to-muted/40 hover:from-muted hover:to-muted/60 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                "p-2 rounded-lg border",
                isProcessing && currentConfig ? currentConfig.bgColor : "bg-muted border-border"
              )}>
                {isProcessing ? (
                  currentConfig ? (
                    <currentConfig.icon className={cn("h-5 w-5 animate-pulse", currentConfig.color)} />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )
                ) : (
                  <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              {isProcessing && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-card" />
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm text-foreground">
                {isProcessing && currentConfig ? currentConfig.label : "Agent Activity"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isProcessing && currentConfig 
                  ? currentConfig.description 
                  : agentHistory.length > 0 
                    ? `${agentHistory.length} steps completed`
                    : "Waiting..."
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                Live
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Activity Timeline */}
        {isExpanded && (
          <m.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="max-h-72 overflow-y-auto"
          >
            <div className="p-3 space-y-1">
              {agentHistory.length === 0 && isProcessing && (
                <div className="flex items-center gap-3 p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Initializing agents...</span>
                </div>
              )}
              
              {agentHistory.map((activity, index) => {
                const config = agentConfig[activity.agent] || agentConfig.orchestrator
                const Icon = config.icon
                const isActive = activeAgent === activity.agent && isProcessing && index === agentHistory.length - 1
                const isComplete = !isActive

                return (
                  <m.div
                    key={`${activity.agent}-${activity.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 text-sm transition-all border",
                      isActive 
                        ? cn(config.bgColor, "shadow-sm") 
                        : "bg-transparent border-transparent hover:bg-muted/50"
                    )}
                  >
                    {/* Step indicator / Icon */}
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                      isActive ? config.bgColor : "bg-muted"
                    )}>
                      {isActive ? (
                        <Loader2 className={cn("h-4 w-4 animate-spin", config.color)} />
                      ) : isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Icon className={cn("h-4 w-4", config.color)} />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          isActive ? config.color : "text-foreground"
                        )}>
                          {config.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium uppercase tracking-wide">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {activity.action}
                      </div>
                    </div>
                  </m.div>
                )
              })}
            </div>
          </m.div>
        )}

        {/* Progress indicator */}
        {isProcessing && (
          <div className="h-1 bg-muted">
            <m.div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 30, ease: "linear" }}
            />
          </div>
        )}
      </m.div>
    </LazyMotion>
  )
}

