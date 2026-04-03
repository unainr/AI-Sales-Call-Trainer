'use server'

import { db } from "@/drizzle/db"
import { formSchema } from "./schema"
import { Call, calls, NewCall } from "@/drizzle/schema"
import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { generateText, Output } from "ai"
import { groq } from "@ai-sdk/groq"
import { feedbackSchema } from "@/lib/utils"
import { buildFeedbackPrompt } from "./prompt"
import { canCreateCall } from "@/modules/pricing/server/pricing"
export const CreateCall = async (values:z.infer<typeof formSchema>) => { 
const {userId} = await auth()
if(!userId) return {error:'Unauthorized'}
const allowed = await canCreateCall()
if (!allowed) return { error: 'You have reached your call limit. Please upgrade your plan.' }
const validatedFields = formSchema.safeParse(values)
if(!validatedFields.success) return {error:'Invalid fields'}

const {productName,industry,difficulty,yourRole,callGoal,persona}= validatedFields.data
try {
    const [data] = await db.insert(calls).values({
        productName,
        industry,
        difficulty,
        yourRole,
        callGoal,
        userId,
        persona,
        status:'pending'
    }as NewCall).returning()
    return{
    success:'Call Created',data:data
}
} catch (error) {
      console.error(error)
    return {error:'Something went wrong'}
}

 }

// TODO: Get call by Id
export const getCallById = async (id: string) => {
   // ✅ Pricing gate
  const allowed = await canCreateCall()
  if (!allowed) return { success: false, error: 'limit_reached' }
  try {
    // Select the call where id matches
    const data: Call[] = await db.select().from(calls).where(eq(calls.id, id))

    if (data.length === 0) {
      return { success: false, error: 'Call not found' }
    }

    // Since id is unique, we can safely take the first element
    const call = data[0]

    return {
      success: true,
      data: call
    }
  } catch (error) {
    console.error("getCallById error:", error)
    return { error: 'Something went wrong' }
  }
}



// TODO: Get Vapi call id 
export async function updateCallVapiId(callId: string, vapiCallId: string) {
  await db
    .update(calls)
    .set({
      vapiCallId,
      status: "active",
      startedAt: new Date()
    })
    .where(eq(calls.id, callId))
}

// TODO: Get call
// in create-call.ts — replace getCall with this
export async function getCall(callId: string): Promise<Call | null> {
  try {
    const data = await db
      .select()
      .from(calls)
      .where(eq(calls.id, callId))
      .limit(1)
    return data[0] ?? null
  } catch (error) {
    console.error("getCall error:", error)
    return null
  }
}


// ── Fetch transcript from Vapi + generate feedback with Groq ──
// Called when user clicks "Generate Feedback" button
export async function generateFeedback(callId: string, vapiCallId: string) {

  try {
    // 1. Fetch call details from Vapi API
    const res = await fetch(`https://api.vapi.ai/call/${vapiCallId}`, {
      headers: { 'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}` }
    })
 
    if (!res.ok) {
      console.error("[generateFeedback] Vapi API error:", res.status)
      return { error: 'Could not fetch call data. Try again in a moment.' }
    }
 
    const vapiCall = await res.json()
//  console.log("[generateFeedback] full response:", JSON.stringify(vapiCall))

    // Vapi returns messages at top level with role "bot" not "assistant"
const messages = vapiCall?.messages ?? []
const transcript = messages
  .filter((m: any) => m.role === 'user' || m.role === 'bot')
  .map((m: any) => `${m.role === 'user' ? 'Rep' : 'Prospect'}: ${m.message ?? ''}`)
  .join('\n')
  .trim()

// Fall back to top-level transcript string if messages are empty
const finalTranscript = transcript || vapiCall?.transcript || ""

if (!finalTranscript) {
  return { error: 'Transcript not ready yet. Wait a few seconds and try again.' }
}

// Recording URL and duration are at top level, not inside artifact
const recordingUrl    = vapiCall?.artifact?.recordingUrl ?? vapiCall?.recordingUrl ?? null
const startedAt       = vapiCall?.startedAt ?? null
const endedAt         = vapiCall?.endedAt   ?? null
const durationSeconds = startedAt && endedAt
  ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  : null
 
    // 4. Get call row for context
    const [callRow] = await db.select().from(calls).where(eq(calls.id, callId)).limit(1)
    if (!callRow) return { error: 'Call not found' }
 
    // 5. Generate AI feedback with Groq
    const result  = await generateText({
      model: groq('moonshotai/kimi-k2-instruct-0905'),
      maxOutputTokens: 4000,
      output:Output.object({
        schema:feedbackSchema
      }),
    prompt: buildFeedbackPrompt({
    productName: callRow.productName,
    industry:    callRow.industry,
    difficulty:  callRow.difficulty,
    callGoal:    callRow.callGoal,
    yourRole:    callRow.yourRole,
    transcript:  finalTranscript,
  }),
    })
 
   const feedback = result.output
 
    // 6. Save everything to DB
    await db.update(calls).set({
      status:          'completed',
      transcript:finalTranscript,
      feedback:        JSON.stringify(feedback),
      recordingUrl,
      durationSeconds,
      startedAt:       startedAt ? new Date(startedAt) : null,
      endedAt:         endedAt   ? new Date(endedAt)   : new Date(),
    }).where(eq(calls.id, callId))
 
    return { success: true }
 
  } catch (error) {
    console.error("[generateFeedback] Error:", error)
    return { error: 'Something went wrong. Please try again.' }
  }
}


// TODO: Get Sales Agent
export type CallRow = typeof calls.$inferSelect
export const SalesAgentByUser= async() =>{
  const {userId}  = await auth()
   if (!userId) {
      return { error: "Unauthorized" };
    }
  try {
    const data = await db
      .select()
      .from(calls)
      .where(eq(calls.userId, userId))
      .orderBy(desc(calls.createdAt))
     return { success: true, data };
  } catch (error) {
    console.error("getSalesAgent error:", error)
    return null
  }
}


export async function deleteCall(callId: string) {
  const { userId } = await auth()
  if (!userId) return { error: "Unauthorized" }
 
  try {
    await db.delete(calls).where(and(
                eq(calls.id, callId),
                eq(calls.userId, userId) // 👈 double check ownership on delete
            ))
    return { success: true }
  } catch {
    return { error: "Failed to delete" }
  }
}