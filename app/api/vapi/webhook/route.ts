// app/api/vapi/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { calls } from "@/drizzle/schema"
import { db } from "@/drizzle/db"
import { generateFeedback } from "@/lib/feedback-generate"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    if (message?.type !== "end-of-call-report") {
      return NextResponse.json({ received: true })
    }

    const vapiCallId: string = message.call?.id
    if (!vapiCallId) {
      return NextResponse.json({ error: "No call id" }, { status: 400 })
    }

    // Build transcript string
    const rawMessages: { role: string; message?: string; content?: string }[] =
      message.messages ?? []
    const transcript = rawMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => `${m.role === "user" ? "Rep" : "Prospect"}: ${m.message ?? m.content ?? ""}`)
      .join("\n")

    const durationSeconds: number = Math.round(message.durationSeconds ?? 0)

    // Find the call row
    const [callRow] = await db
      .select()
      .from(calls)
      .where(eq(calls.vapiCallId, vapiCallId))
      .limit(1)

    if (!callRow) {
      console.error("No call row for vapiCallId:", vapiCallId)
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    // Generate feedback with Groq
    let feedbackJson = ""
    try {
      const result = await generateFeedback(transcript, {
        productName: callRow.productName,
        industry:    callRow.industry,
        difficulty:  callRow.difficulty,
        callGoal:    callRow.callGoal,
        yourRole:    callRow.yourRole,
      })
      feedbackJson = JSON.stringify(result)
    } catch (err) {
      console.error("Feedback generation failed:", err)
      feedbackJson = JSON.stringify({
        summary: "Feedback could not be generated for this session.",
        strengths: [],
        improvements: [],
        outcome: "partial",
        tip: "Try again on your next call.",
      })
    }

    // Save to DB
    await db
      .update(calls)
      .set({
        status:          "completed",
        transcript,
        feedback:        feedbackJson,
        durationSeconds,
        endedAt:         new Date(),
      })
      .where(eq(calls.vapiCallId, vapiCallId))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}