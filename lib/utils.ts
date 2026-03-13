import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {z} from "zod"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const feedbackSchema = z.object({
  summary:      z.string(),
  strengths:    z.array(z.string()).length(3),
  improvements: z.array(z.string()).length(3),
  outcome:      z.enum(["success", "partial", "failed"]),
  tip:          z.string(),
})