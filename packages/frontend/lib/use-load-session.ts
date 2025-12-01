import { useThreadRuntime } from "@assistant-ui/react"
import { useAgentStore } from "./agent-store"

interface SessionMessage {
  role: string
  content: string
  timestamp?: string
}

interface AgentActivity {
  agent: string
  action: string
  output: string | Record<string, unknown>
  timestamp?: number
}

interface Session {
  _id: string
  created_at: string
  messages: SessionMessage[]
  agent_history?: Record<string, AgentActivity[]>
}

export function useLoadSession() {
  const thread = useThreadRuntime()
  const { setSessionId, clearHistory, setAgentHistory } = useAgentStore()

  const loadSession = async (sessionId: string) => {
    try {
      // Fetch session details
      const response = await fetch(`/api/sessions/${sessionId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch session")
      }

      const session: Session = await response.json()
      
      // Set the session ID in the store
      setSessionId(sessionId)
      clearHistory()

      // Restore agent_history if available
      // Since agent_history is stored by query_id and we want to show it for the most recent response,
      // we'll restore the most recent agent_history (the one with the latest timestamps)
      if (session.agent_history) {
        const allHistories: { queryId: string; history: AgentActivity[]; maxTimestamp: number }[] = []
        let baseTimestamp = Date.now() - 1000000 // Start from 1 second ago to ensure proper ordering
        
        // Process all agent_history entries
        for (const queryId in session.agent_history) {
          const history = session.agent_history[queryId]
          if (Array.isArray(history) && history.length > 0) {
            // Convert stored history to AgentActivity format
            // Use sequential timestamps to maintain order
            const convertedHistory = history.map((activity, index) => ({
              agent: activity.agent,
              action: activity.action,
              output: activity.output,
              timestamp: activity.timestamp || (baseTimestamp + index * 1000),
            }))
            // Find the maximum timestamp in this history
            const maxTimestamp = Math.max(...convertedHistory.map(a => a.timestamp || 0))
            allHistories.push({ queryId, history: convertedHistory, maxTimestamp })
            baseTimestamp += history.length * 1000 // Increment for next query
          }
        }
        
        // Sort by maxTimestamp to find the most recent agent_history
        allHistories.sort((a, b) => b.maxTimestamp - a.maxTimestamp)
        
        // Restore only the most recent agent_history (for the most recent assistant message)
        if (allHistories.length > 0) {
          setAgentHistory(allHistories[0].history)
        }
      }

      // Load messages into the thread
      if (session.messages && session.messages.length > 0) {
        // Convert session messages to thread message format
        const threadMessages = session.messages
          .map((msg, index) => {
            if (msg.role === "user" || msg.role === "assistant") {
              return {
                id: `msg-${index}`,
                role: msg.role as "user" | "assistant",
                content: [{ type: "text" as const, text: msg.content }],
              }
            }
            return null
          })
          .filter((msg): msg is NonNullable<typeof msg> => msg !== null)

        // Reset thread with the loaded messages
        thread.reset(threadMessages)
      } else {
        // Reset to empty thread if no messages
        thread.reset()
      }

      return session
    } catch (error) {
      console.error("Error loading session:", error)
      throw error
    }
  }

  return { loadSession }
}

