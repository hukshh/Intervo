import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(8).default("temp-jwt-secret-key-at-least-thirty-two-chars-long-for-dev"),
  OPENAI_API_KEY: z.string().optional(),
  VAPI_PUBLIC_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Parse and export environment variables
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  VAPI_PUBLIC_KEY: process.env.VAPI_PUBLIC_KEY,
  NODE_ENV: process.env.NODE_ENV,
})
