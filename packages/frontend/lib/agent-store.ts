import { create } from "zustand"
import type { AgentActivity, AgentActivityInput } from "./types"

interface AgentState {
  activeAgent: string | null
  agentHistory: AgentActivity[]
  sessionId: string | null
  isProcessing: boolean
  setActiveAgent: (agent: string | null) => void
  addAgentActivity: (activity: AgentActivityInput) => void
  clearHistory: () => void
  setAgentHistory: (history: AgentActivity[]) => void
  setSessionId: (id: string | null) => void
  setIsProcessing: (processing: boolean) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  activeAgent: null,
  agentHistory: [],
  sessionId: null,
  isProcessing: false,
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  addAgentActivity: (activity) =>
    set((state) => ({
      agentHistory: [
        ...state.agentHistory,
        { ...activity, timestamp: Date.now() },
      ],
    })),
  clearHistory: () => set({ agentHistory: [], activeAgent: null }),
  setAgentHistory: (history) => set({ agentHistory: history }),
  setSessionId: (id) => set({ sessionId: id }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
}))

