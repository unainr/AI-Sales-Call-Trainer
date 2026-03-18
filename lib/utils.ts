import { voiceOptions } from "@/constants"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {z} from "zod"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const feedbackSchema = z.object({
   summary:      z.string(),
  strengths:    z.array(z.string()).min(2).max(5),
  improvements: z.array(z.string()).min(2).max(5),
  outcome:      z.enum(["success", "partial", "failed"]),
  tip:          z.string(),
})


export const DEFAULT_VOICE = 'rachel';


export const getVoice = (persona?: string) => {
  if (!persona) return voiceOptions[DEFAULT_VOICE];

  // Find by voice ID
  const voiceEntry = Object.values(voiceOptions).find((v) => v.id === persona);
  if (voiceEntry) return voiceEntry;

  // Find by key
  const voiceByKey = voiceOptions[persona as keyof typeof voiceOptions];
  if (voiceByKey) return voiceByKey;

  // Default fallback
  return voiceOptions[DEFAULT_VOICE];
};


export function startOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}