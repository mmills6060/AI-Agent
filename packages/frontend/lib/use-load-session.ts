import { useThreadRuntime } from "@assistant-ui/react"
import { useAgentStore } from "./agent-store"

interface SessionMessage {
  role: string
  content: string
  timestamp?: string
}

interface Session {
  _id: string
  created_at: string
  messages: SessionMessage[]
}

export function useLoadSession() {
  const thread = useThreadRuntime()
  const { setSessionId, clearHistory } = useAgentStore()

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

