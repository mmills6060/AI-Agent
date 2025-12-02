import type React from "react"
import { useAgentStore } from "@/lib/agent-store"
import type { ThreadRuntime } from "@assistant-ui/react"
import type { Session } from "@/lib/types"
import { deleteSession } from "./deleteSession"

interface HandleConfirmDeleteParams {
  sessionToDelete: Session
  selectedSessionId?: string | null
  thread: ThreadRuntime | null
  setDeletingSessionId: (sessionId: string | null) => void
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>
  setSessionToDelete: (session: Session | null) => void
  setError: (error: string | null) => void
  onSelectSession?: (sessionId: string) => void
}

export async function handleConfirmDelete({
  sessionToDelete,
  selectedSessionId,
  thread,
  setDeletingSessionId,
  setSessions,
  setSessionToDelete,
  setError,
  onSelectSession,
}: HandleConfirmDeleteParams) {
  try {
    setDeletingSessionId(sessionToDelete._id)
    await deleteSession(sessionToDelete._id)
    
    // Remove from list
    setSessions(prev => prev.filter(s => s._id !== sessionToDelete._id))
    
    // If deleted session was selected, clear selection
    if (selectedSessionId === sessionToDelete._id) {
      if (thread?.reset) {
        try {
          thread.reset([])
        } catch (resetError) {
          console.warn("Thread reset failed:", resetError)
        }
      }
      useAgentStore.getState().setSessionId(null)
      useAgentStore.getState().clearHistory()
      if (onSelectSession) {
        onSelectSession("")
      }
    }
    
    setSessionToDelete(null)
  } catch (error) {
    console.error("Failed to delete session:", error)
    setError("Failed to delete conversation")
    setSessionToDelete(null)
  } finally {
    setDeletingSessionId(null)
  }
}

