'use server'
import { generateText } from "ai"
import { groq } from '@ai-sdk/groq';

export type FeedbackResult = {
  summary: string        // 2–3 sentence overall assessment
  strengths: string[]    // 3 things done well
  improvements: string[] // 3 areas to improve
  outcome: "success" | "partial" | "failed"
  tip: string            // one closing actionable tip
}

export async function getFeedback(
  messages: { role: string; content: string }[],
  config: {
    productName: string
    industry:    string
    difficulty:  string
    callGoal:    string
    yourRole:    string
  }
): Promise<FeedbackResult> {
  const transcript = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "Rep" : "Prospect"}: ${m.content}`)
    .join("\n")

  if (!transcript.trim()) {
    return {
      summary:      "The call was too short to evaluate.",
      strengths:    [],
      improvements: ["Start the call and engage with the prospect."],
      outcome:      "failed",
      tip:          "Try to speak for at least 30 seconds.",
    }
  }

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: `
You are an expert sales coach reviewing a practice sales call.

CALL CONTEXT:
- Product: ${config.productName}
- Industry: ${config.industry}
- Difficulty: ${config.difficulty}
- Goal: ${config.callGoal}
- Rep Role: ${config.yourRole}

TRANSCRIPT:
${transcript}

Respond ONLY with a valid JSON object. No markdown, no backticks.

{
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "outcome": "<success | partial | failed>",
  "tip": "<one specific actionable tip for next time>"
}`.trim(),
  })

  return JSON.parse(text.replace(/```json|```/g, "").trim()) as FeedbackResult
}