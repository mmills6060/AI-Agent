"use client"

import { AssistantRuntimeProvider } from "@assistant-ui/react"
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk"
import { Thread } from "@/components/assistant-ui/thread"
import { ThreadList } from "@/components/assistant-ui/thread-list"
import { ExportPanel } from "@/components/export-button"

export function Assistant() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="grid h-dvh grid-cols-[200px_1fr]">
        <ThreadList />
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden px-4 py-4">
            <Thread />
          </div>
          <ExportPanel />
        </div>
      </div>
    </AssistantRuntimeProvider>
  )
}
