import { create } from "zustand"

interface AgentActivity {
  agent: string
  action: string
  output: string | Record<string, unknown>
  timestamp: number
}

interface AgentState {
  activeAgent: string | null
  agentHistory: AgentActivity[]
  sessionId: string | null
  isProcessing: boolean
  setActiveAgent: (agent: string | null) => void
  addAgentActivity: (activity: Omit<AgentActivity, "timestamp">) => void
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

