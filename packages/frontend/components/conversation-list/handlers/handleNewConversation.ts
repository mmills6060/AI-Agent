import { useAgentStore } from "@/lib/agent-store"
import type { ThreadRuntime } from "@assistant-ui/react"

interface HandleNewConversationParams {
  thread: ThreadRuntime | null
  onSelectSession?: (sessionId: string) => void
}

export function handleNewConversation({ thread, onSelectSession }: HandleNewConversationParams) {
  try {
    // Safely reset thread if available
    if (thread?.reset) {
      try {
        // Try resetting with empty array first, fallback to no args
        thread.reset([])
      } catch (resetError) {
        // If reset fails, continue with other cleanup
        console.warn("Thread reset failed, continuing with cleanup:", resetError)
      }
    }
    useAgentStore.getState().setSessionId(null)
    useAgentStore.getState().clearHistory()
    if (onSelectSession) {
      onSelectSession("")
    }
  } catch (error) {
    console.error("Failed to clear conversation:", error)
  }
}

