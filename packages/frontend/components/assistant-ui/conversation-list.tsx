"use client"

import { useEffect, useState, type FC } from "react"
import { PlusIcon, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAgentStore } from "@/lib/agent-store"
import { useLoadSession } from "@/lib/use-load-session"
import { useThreadRuntime } from "@assistant-ui/react"

interface Session {
  _id: string
  created_at: string
  messages: Array<{
    role: string
    content: string
    timestamp?: string
  }>
}

interface ConversationListProps {
  onSelectSession?: (sessionId: string) => void
  selectedSessionId?: string | null
}

export const ConversationList: FC<ConversationListProps> = ({
  onSelectSession,
  selectedSessionId,
}) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)
  const { loadSession } = useLoadSession()
  const thread = useThreadRuntime()

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/sessions?limit=100")
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", response.status, errorText)
        throw new Error(`Failed to fetch sessions: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Fetched sessions:", data)
      setSessions(data.sessions || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load conversations"
      setError(errorMessage)
      console.error("Error fetching sessions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleNewConversation = () => {
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

  const handleSelectSession = async (sessionId: string) => {
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

  const getConversationTitle = (session: Session): string => {
    const firstUserMessage = session.messages?.find(msg => msg.role === "user")
    if (firstUserMessage?.content) {
      const content = firstUserMessage.content
      return content.length > 50 ? content.substring(0, 50) + "..." : content
    }
    return "New Conversation"
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString()
    } catch {
      return ""
    }
  }

  return (
    <div className="flex flex-col h-full w-[250px] bg-background border-r-2 border-border relative z-10">
      <div className="p-3 border-b border-border shrink-0">
        <Button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-start gap-2"
          variant="ghost"
        >
          <PlusIcon className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : error ? (
          <div className="p-4 text-sm text-destructive">
            {error}
            <Button
              onClick={fetchSessions}
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              Retry
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No previous conversations
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2">
            {sessions.map((session) => {
              const isSelected = selectedSessionId === session._id
              return (
                <button
                  key={session._id}
                  onClick={() => handleSelectSession(session._id)}
                  disabled={loadingSessionId === session._id}
                  className={cn(
                    "flex flex-col gap-1 px-3 py-2 rounded-lg text-left transition-all",
                    "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isSelected && "bg-muted",
                    loadingSessionId === session._id && "opacity-50 cursor-wait"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {loadingSessionId === session._id ? (
                      <Loader2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium line-clamp-2 flex-1">
                      {getConversationTitle(session)}
                    </span>
                  </div>
                  {session.created_at && (
                    <span className="text-xs text-muted-foreground ml-6">
                      {formatDate(session.created_at)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const ConversationListSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 px-3 py-2"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

