export interface SessionMessage {
  role: string
  content: string
  timestamp?: string
}

export interface AgentActivity {
  agent: string
  action: string
  output: string | Record<string, unknown>
  timestamp: number
}

export type AgentActivityInput = Omit<AgentActivity, "timestamp">

export interface Session {
  _id: string
  created_at: string
  messages: SessionMessage[]
  agent_history?: Record<string, AgentActivity[]>
}

