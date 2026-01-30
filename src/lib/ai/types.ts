import type { ScoringResult } from '@/lib/scoring'
import type { OfficialReport } from '@/types/database'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AIChatContext {
  ecgId: string
  scoringResult: ScoringResult
  officialReport: OfficialReport
}

export interface AIChatRequest {
  message: string
  context: AIChatContext
  history: ChatMessage[]
}

export interface AIChatResponse {
  message: string
  error?: string
}
