"use client"

import { Thread } from "@/components/assistant-ui/thread"
import { ThreadList } from "@/components/assistant-ui/thread-list"
import { ExportPanel } from "@/components/export-button"

export function Assistant() {
  return (
    <div className="grid h-dvh grid-cols-[200px_1fr]">
      <ThreadList />
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden px-4 py-4">
          <Thread />
        </div>
        <ExportPanel />
      </div>
    </div>
  )
}
