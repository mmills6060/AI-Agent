"use client"

import { useEffect, useState, type FC } from "react"
import { PlusIcon, MessageSquare, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useLoadSession } from "@/lib/use-load-session"
import { useThreadRuntime } from "@assistant-ui/react"
import { formatDate } from "@/util/formatDate"
import type { Session } from "@/lib/types"
import { handleNewConversation } from "./handlers/handleNewConversation"
import { handleSelectSession } from "./handlers/handleSelectSession"
import { handleConfirmDelete } from "./handlers/handleConfirmDelete"

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
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)
  const { loadSession } = useLoadSession()
  const thread = useThreadRuntime()

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/sessions?limit=100")
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch sessions: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load conversations"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const getConversationTitle = (session: Session): string => {
    const firstUserMessage = session.messages?.find(msg => msg.role === "user")
    if (firstUserMessage?.content) {
      const content = firstUserMessage.content
      return content.length > 50 ? content.substring(0, 50) + "..." : content
    }
    return "New Conversation"
  }

  const handleDeleteClick = (e: React.MouseEvent, session: Session) => {
    e.stopPropagation()
    setSessionToDelete(session)
  }

  const handleCancelDelete = () => {
    setSessionToDelete(null)
  }

  return (
    <div className="flex flex-col h-full w-[250px] bg-background border-r-2 border-border relative z-10">
      <div className="p-3 border-b border-border shrink-0">
        <Button
          onClick={() => handleNewConversation({ thread, onSelectSession })}
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
              const isDeleting = deletingSessionId === session._id
              return (
                <div
                  key={session._id}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg transition-all",
                    "hover:bg-muted",
                    isSelected && "bg-muted"
                  )}
                >
                  <button
                    onClick={() => handleSelectSession({
                      sessionId: session._id,
                      loadSession,
                      setLoadingSessionId,
                      setError,
                      onSelectSession,
                    })}
                    disabled={loadingSessionId === session._id || isDeleting}
                    className={cn(
                      "flex flex-col gap-1 px-3 py-2 rounded-lg text-left transition-all flex-1",
                      "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      isSelected && "bg-muted",
                      (loadingSessionId === session._id || isDeleting) && "opacity-50 cursor-wait"
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
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => handleDeleteClick(e, session)}
                    disabled={isDeleting}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-2",
                      "hover:bg-muted-foreground/10 hover:text-muted-foreground",
                      isDeleting && "opacity-100"
                    )}
                    aria-label="Delete conversation"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!sessionToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
              {sessionToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  "{getConversationTitle(sessionToDelete)}"
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={!!deletingSessionId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConfirmDelete({
                sessionToDelete: sessionToDelete!,
                selectedSessionId: selectedSessionId!,
                thread,
                setDeletingSessionId,
                setSessions,
                setSessionToDelete,
                setError,
                onSelectSession,
              })}
              disabled={!!deletingSessionId}
            >
              {deletingSessionId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

