interface HandleSelectSessionParams {
  sessionId: string
  loadSession: (sessionId: string) => Promise<unknown>
  setLoadingSessionId: (sessionId: string | null) => void
  setError: (error: string | null) => void
  onSelectSession?: (sessionId: string) => void
}

export async function handleSelectSession({
  sessionId,
  loadSession,
  setLoadingSessionId,
  setError,
  onSelectSession,
}: HandleSelectSessionParams) {
  try {
    setLoadingSessionId(sessionId)
    await loadSession(sessionId)
    if (onSelectSession) {
      onSelectSession(sessionId)
    }
  } catch (error) {
    console.error("Failed to load session:", error)
    setError("Failed to load conversation")
  } finally {
    setLoadingSessionId(null)
  }
}

