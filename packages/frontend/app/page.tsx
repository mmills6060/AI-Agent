"use client"

import { Assistant } from "./assistant"
import { AgentActivityPanel } from "@/components/agent-activity-panel"

export default function Home() {
  return (
    <>
      <Assistant />
      <AgentActivityPanel />
    </>
  )
}
