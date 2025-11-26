"use client"

import { 
  AssistantRuntimeProvider, 
  useLocalRuntime, 
  type ChatModelAdapter,
  type ChatModelRunResult
} from "@assistant-ui/react"
import { AssistantModal } from "./assistant-modal"
import { ReactNode } from "react"
import { useAgentStore } from "@/lib/agent-store"

interface AgentUpdateData {
  active_agent?: string
  agent_history?: Array<{
    agent: string
    action: string
    output: string | Record<string, unknown>
  }>
  execution_plan?: string
  search_queries?: string[]
  research_results_count?: number
  validated_facts_count?: number
}

interface SSEEvent {
  type: "agent_update" | "final_response"
  agent?: string
  data?: AgentUpdateData
  content?: string
}

const LangGraphAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const { 
      setActiveAgent, 
      addAgentActivity, 
      clearHistory, 
      setSessionId: _setSessionId,
      setIsProcessing 
    } = useAgentStore.getState()
    
    clearHistory()
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: typeof msg.content === 'string' 
              ? msg.content 
              : msg.content.map(part => {
                  if (part.type === 'text') return part.text
                  return ''
                }).join('')
          }))
        }),
        signal: abortSignal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')

      if (!reader) {
        throw new Error("No response body")
      }

      let fullText = ""
      let buffer = ""
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        const lines = buffer.split('\n')

        if (!buffer.endsWith('\n')) {
          buffer = lines.pop() || ''
        } else {
          buffer = ''
        }

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            
            if (dataStr === '[DONE]') continue
            
            try {
              const data: SSEEvent = JSON.parse(dataStr)
              
              // Debug: Log all SSE events
              console.log('[SSE Event]', data.type, data.agent, data)
              
              if (data.type === 'agent_update' && data.agent && data.data) {
                console.log('[Agent Update]', data.agent, data.data)
                setActiveAgent(data.agent)
                
                // Add latest activity from history
                const history = data.data.agent_history
                if (history && history.length > 0) {
                  const latest = history[history.length - 1]
                  console.log('[Adding Activity]', latest)
                  addAgentActivity({
                    agent: latest.agent,
                    action: latest.action,
                    output: latest.output
                  })
                }
              } else if (data.type === 'final_response' && data.content) {
                fullText = data.content
                setIsProcessing(false)
                setActiveAgent(null)
                
                const result: ChatModelRunResult = {
                  content: [{
                    type: "text",
                    text: fullText
                  }]
                }
                yield result
              } else if (data.type === 'delta') {
                // Handle legacy delta format
                const deltaData = data as unknown as { type: string; content: string }
                fullText += deltaData.content
                
                const result: ChatModelRunResult = {
                  content: [{
                    type: "text",
                    text: fullText
                  }]
                }
                yield result
              } else if (data.type === 'error') {
                const errorData = data as unknown as { type: string; error: string }
                throw new Error(errorData.error)
              }
            } catch (e) {
              if (e instanceof SyntaxError) {
                console.error('Failed to parse SSE line:', line, e)
              } else {
                throw e
              }
            }
          }
        }
      }

      if (buffer.trim()) {
        if (buffer.startsWith('data: ')) {
          const dataStr = buffer.slice(6).trim()
          if (dataStr !== '[DONE]') {
            try {
              const data: SSEEvent = JSON.parse(dataStr)
              if (data.type === 'final_response' && data.content) {
                fullText = data.content
              }
            } catch (e) {
              console.error('Failed to parse final buffer:', buffer, e)
            }
          }
        }
      }

      const remaining = decoder.decode(undefined, { stream: false })
      if (remaining) {
        console.error('Decoder had remaining bytes:', remaining)
      }

      setIsProcessing(false)
      setActiveAgent(null)

      if (fullText) {
        const result: ChatModelRunResult = {
          content: [{
            type: "text",
            text: fullText
          }]
        }
        yield result
      }
    } catch (error) {
      setIsProcessing(false)
      setActiveAgent(null)
      
      const result: ChatModelRunResult = {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
        }]
      }
      yield result
    }
  }
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime(LangGraphAdapter)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
      <AssistantModal />
    </AssistantRuntimeProvider>
  )
}
