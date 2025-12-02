"use client"

import { useState } from "react"
import Link from "next/link"
import { ConversationList } from "@/components/conversation-list/conversation-list"
import { Thread } from "@/components/thread/thread"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="shrink-0 w-[250px] h-full">
        <ConversationList 
          onSelectSession={setSelectedSessionId}
          selectedSessionId={selectedSessionId}
        />
      </div>
      <Link
        href="/docs"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "absolute top-4 right-4 z-50"
        )}
      >
        Docs
      </Link>
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <div className="flex-1 overflow-hidden px-4 py-4">
          <Thread />
        </div>
      </div>
    </div>
  )
}
