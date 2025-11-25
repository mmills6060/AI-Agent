"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileJson, FileSpreadsheet } from "lucide-react"
import { useAgentStore } from "@/lib/agent-store"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export function ExportButton() {
  const { sessionId } = useAgentStore()
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport(format: "json" | "csv") {
    if (!sessionId) return
    
    setIsExporting(true)
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/export/${sessionId}?format=${format}`
      )
      
      if (!response.ok) throw new Error("Export failed")
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `session_${sessionId}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!sessionId) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("json")}
        disabled={isExporting}
        className="gap-2"
      >
        <FileJson className="h-4 w-4" />
        JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={isExporting}
        className="gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        CSV
      </Button>
    </div>
  )
}

export function ExportPanel() {
  const { sessionId } = useAgentStore()

  if (!sessionId) return null

  return (
    <div className="flex items-center gap-3 p-3 border-t border-border bg-muted/30">
      <Download className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Export conversation:</span>
      <ExportButton />
    </div>
  )
}

