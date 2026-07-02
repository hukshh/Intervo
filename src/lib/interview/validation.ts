import { z } from "zod"

export const createInterviewSchema = z.object({
  interviewType: z.enum(["BEHAVIORAL", "TECHNICAL", "SYSTEM_DESIGN", "HR"], {
    message: "Invalid interview type. Allowed: BEHAVIORAL, TECHNICAL, SYSTEM_DESIGN, HR",
  }),
  experienceLevel: z.enum(["JUNIOR", "MID", "SENIOR"], {
    message: "Invalid experience level. Allowed: JUNIOR, MID, SENIOR",
  }),
})

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>
