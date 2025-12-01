"use client"

import { useState } from "react"
import { Thread } from "@/components/assistant-ui/thread"
import { ConversationList } from "@/components/assistant-ui/conversation-list"
import { ExportPanel } from "@/components/export-button"

export function Assistant() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="shrink-0 w-[250px] h-full">
        <ConversationList 
          onSelectSession={setSelectedSessionId}
          selectedSessionId={selectedSessionId}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <div className="flex-1 overflow-hidden px-4 py-4">
          <Thread />
        </div>
        <ExportPanel />
      </div>
    </div>
  )
}
