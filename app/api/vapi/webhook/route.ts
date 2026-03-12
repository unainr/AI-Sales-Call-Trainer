// app/api/vapi/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { db } from "@/drizzle/db"
import { calls } from "@/drizzle/schema"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

// ─────────────────────────────────────────────
// Vapi sends POST to this route for:
//   1. end-of-call-report  → save transcript + generate feedback
//   2. tool-calls          → (not used in this app, ignored)
//   3. status-update       → ignored
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // All Vapi events arrive as { message: { type, ... } }
    const { message } = body

    // Only process end-of-call-report — ignore everything else
    if (!message || message.type !== "end-of-call-report") {
      return NextResponse.json({ received: true })
    }

    // ── 1. Extract call ID ──────────────────────────────────
    // This is the Vapi call ID — matches vapiCallId we saved in useVapiAgent
    const vapiCallId: string | undefined = message?.call?.id
    if (!vapiCallId) {
      console.error("[webhook] Missing call.id in payload")
      return NextResponse.json({ error: "No call id" }, { status: 400 })
    }

    // ── 2. Extract transcript from artifact ────────────────
    // Vapi docs shape:
    // message.artifact.transcript → preformatted string "AI: Hello\nUser: Hi"
    // message.artifact.messages   → [{ role: "assistant"|"user", message: "..." }]
    const artifact   = message?.artifact ?? {}
    const rawMessages: { role: string; message?: string; content?: string }[] = artifact.messages ?? []

    // Build clean transcript from messages array (more reliable)
    const transcript = rawMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => {
        const text = m.message ?? m.content ?? ""
        return `${m.role === "user" ? "Rep" : "Prospect"}: ${text}`
      })
      .join("\n")
      .trim()

    // Fall back to pre-formatted string if messages array is empty
    const finalTranscript = transcript || (artifact.transcript as string) || ""

    // ── 3. Calculate duration ──────────────────────────────
    const startedAt = message?.call?.startedAt
    const endedAt   = message?.call?.endedAt
    const durationSeconds =
      startedAt && endedAt
        ? Math.round(
            (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
          )
        : null

    // ── 4. Find DB row by vapiCallId ───────────────────────
    const [callRow] = await db
      .select()
      .from(calls)
      .where(eq(calls.vapiCallId, vapiCallId))
      .limit(1)

    if (!callRow) {
      console.error("[webhook] No DB row for vapiCallId:", vapiCallId)
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

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
  "improvements": ["<specific area 1>",     "<specific area 2>",     "<specific area 3>"],
  "outcome":      "<success | partial | failed>",
  "tip":          "<one specific, actionable tip for next time>"
}

outcome rules:
- success = call goal was clearly achieved
- partial  = some progress made but goal not fully met
- failed   = goal not met or call ended poorly
          `.trim(),
        })

        const cleaned = text.replace(/```json|```/g, "").trim()
        JSON.parse(cleaned) // throws if invalid — caught below
        feedbackJson = cleaned
      } catch (err) {
        console.error("[webhook] Feedback generation failed:", err)
        // Fallback so page still renders something
        feedbackJson = JSON.stringify({
          summary:      "The call was completed. Automatic feedback could not be generated.",
          strengths:    ["You completed the practice session"],
          improvements: ["Try again for detailed AI feedback"],
          outcome:      "partial",
          tip:          "Focus on clearly stating your value proposition in the first 30 seconds.",
        })
      }
    }

    // ── 6. Save to DB ──────────────────────────────────────
    await db
      .update(calls)
      .set({
        status:          "completed",
        transcript:      finalTranscript || null,
        feedback:        feedbackJson    || null,
        durationSeconds: durationSeconds,
        endedAt:         new Date(),
      })
      .where(eq(calls.vapiCallId, vapiCallId))

    console.log("[webhook] Saved call:", vapiCallId)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("[webhook] Unexpected error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}