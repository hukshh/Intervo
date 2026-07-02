import { z } from "zod"
import { InterviewType, ExperienceLevel } from "@prisma/client"

export const createInterviewSchema = z.object({
  interviewType: z.nativeEnum(InterviewType, {
    message: "Invalid interview type. Allowed: BEHAVIORAL, TECHNICAL, SYSTEM_DESIGN, HR",
  }),
  experienceLevel: z.nativeEnum(ExperienceLevel, {
    message: "Invalid experience level. Allowed: JUNIOR, MID, SENIOR",
  }),
})

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>
