'use server'

import { db } from "@/drizzle/db"
import { formSchema } from "./schema"
import { Call, calls, NewCall } from "@/drizzle/schema"
import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
export const CreateCall = async (values:z.infer<typeof formSchema>) => { 
const {userId} = await auth()
if(!userId) return {error:'Unauthorized'}
const validatedFields = formSchema.safeParse(values)
if(!validatedFields.success) return {error:'Invalid fields'}

const {productName,industry,difficulty,yourRole,callGoal}= validatedFields.data
try {
    const [data] = await db.insert(calls).values({
        productName,
        industry,
        difficulty,
        yourRole,
        callGoal,
        userId,
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
      vapiCallId,                // ← THIS was missing — webhook needs this
      status: "active",
      startedAt: new Date()
    })
    .where(eq(calls.id, callId))
}

// TODO: Get call
export async function getCall(callId: string): Promise<Call | null> {
  const { userId } = await auth()
  if (!userId) return null

  try {
    const data: Call[] = await db
      .select()
      .from(calls)
      .where(and(eq(calls.id, callId), eq(calls.userId, userId)))

    if (data.length === 0) return null

    return data[0]
  } catch (error) {
    console.error("getCall error:", error)
    return null
  }
}