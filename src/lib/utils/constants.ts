export const APP_NAME = "Intervo"
export const APP_TAGLINE = "AI-Powered Voice Mock Interview Platform"

export const INTERVIEW_STAGES = [
  "Introduction",
  "Background",
  "Communication",
  "Problem Solving",
  "Leadership",
  "Conflict Resolution",
  "Reflection",
  "Closing",
] as const

export type InterviewStage = typeof INTERVIEW_STAGES[number]

export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]

export const SESSION_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const

export const DEFAULT_VOICE_CONFIG = {
  provider: "vapi",
  voiceId: "jennifer",
} as const

export const INITIAL_INTERVIEWER_MESSAGE = 
  "Hello! I am your interviewer today. I'd love to start by learning a little bit about you. Could you please introduce yourself and tell me about your background?"
