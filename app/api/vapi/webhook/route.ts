import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { generateText } from "ai"
import { createGroq, groq } from "@ai-sdk/groq"
import { db } from "@/drizzle/db"
import { calls } from "@/drizzle/schema"

export const maxDuration = 60


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    // Ignore everything except end-of-call-report
    if (!message || message.type !== "end-of-call-report") {
      return NextResponse.json({ received: true })
    }

    // ── 1. Get Vapi call ID ────────────────────────────────
    // We saved this to DB in updateCallVapiId() when the call started
    // Webhook finds the DB row by matching vapiCallId — NOT metadata
    const vapiCallId: string | undefined = message?.call?.id
    if (!vapiCallId) {
      console.error("[webhook] No call.id in payload")
      return NextResponse.json({ error: "No call id" }, { status: 400 })
    }

    console.log("[webhook] Received end-of-call-report for vapiCallId:", vapiCallId)

    // ── 2. Extract transcript ──────────────────────────────
    const artifact = message?.artifact ?? {}
    const rawMessages: { role: string; message?: string; content?: string }[] = artifact.messages ?? []

    const transcript = rawMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => {
        const text = m.message ?? m.content ?? ""
        return `${m.role === "user" ? "Rep" : "Prospect"}: ${text}`
      })
      .join("\n")
      .trim()

    const finalTranscript = transcript || (artifact.transcript as string) || ""

    // ── 3. Calculate duration ──────────────────────────────
    const startedAt = message?.call?.startedAt
    const endedAt = message?.call?.endedAt
    const durationSeconds =
      startedAt && endedAt
        ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
        : null

    // ── 4. Find DB row by vapiCallId ───────────────────────
    const [callRow] = await db
      .select()
      .from(calls)
      .where(eq(calls.vapiCallId, vapiCallId))
      .limit(1)

    if (!callRow) {
      console.error("[webhook] No DB row found for vapiCallId:", vapiCallId)
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    console.log("[webhook] Found DB row:", callRow.id)

    // ── 5. Generate AI feedback with Groq ──────────────────
    let feedbackJson = ""

    if (finalTranscript) {
      try {
        const { text } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          prompt: `
You are an expert sales coach reviewing a practice sales call.

CALL CONTEXT:
- Product:    ${callRow.productName}
- Industry:   ${callRow.industry}
- Difficulty: ${callRow.difficulty}
- Goal:       ${callRow.callGoal}
- Rep Role:   ${callRow.yourRole}

TRANSCRIPT:
${finalTranscript}

Respond ONLY with a valid JSON object — no markdown, no backticks, no extra text.

{
  "summary":      "<2-3 sentence overall assessment of the call>",
  "strengths":    ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific area 1>", "<specific area 2>", "<specific area 3>"],
  "outcome":      "<success | partial | failed>",
  "tip":          "<one specific actionable tip for next time>"
}

outcome rules:
- success = call goal was clearly achieved
- partial  = some progress made but goal not fully met
- failed   = goal not met or call ended poorly
          `.trim(),
        })

        const cleaned = text.replace(/```json|```/g, "").trim()
        JSON.parse(cleaned)
        feedbackJson = cleaned
        console.log("[webhook] Feedback generated successfully")
      } catch (err) {
        console.error("[webhook] Feedback generation failed:", err)
        feedbackJson = JSON.stringify({
          summary: "The call was completed. Automatic feedback could not be generated.",
          strengths: ["You completed the practice session"],
          improvements: ["Try again for detailed AI feedback"],
          outcome: "partial",
          tip: "Focus on clearly stating your value proposition in the first 30 seconds.",
        })
      }
    }

    // ── 6. Save to DB ──────────────────────────────────────
    await db
      .update(calls)
      .set({
        status: "completed",
        transcript: finalTranscript || null,
        feedback: feedbackJson || null,
        durationSeconds,
        endedAt: new Date(),
      })
      .where(eq(calls.vapiCallId, vapiCallId))

    console.log("[webhook] Successfully saved call:", callRow.id)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("[webhook] Unexpected error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}