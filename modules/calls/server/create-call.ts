'use server'

import { db } from "@/drizzle/db"
import { formSchema } from "./schema"
import { Call, calls, NewCall } from "@/drizzle/schema"
import { z } from "zod"
import { eq } from "drizzle-orm"
export const CreateCall = async (values:z.infer<typeof formSchema>) => { 

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