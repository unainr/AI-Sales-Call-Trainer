// modules/billing/server/queries.ts
"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { calls } from "@/drizzle/schema"
import { eq, sql } from "drizzle-orm"


export type PlanType = "free" | "pro" | "team"

export type UsageStats = {
  plan:         PlanType
  totalCalls:   number
  callLimit:    number  // -1 = unlimited
  agentLimit:   number  // -1 = unlimited
  callPercent:  number  // 0-100 for progress bar
  agentPercent: number  // 0-100 for progress bar
  isAtCallLimit:  boolean
  isAtAgentLimit: boolean
}

// ─── Feature slugs (must match exactly what you set in Clerk Dashboard) ───────
// Free : 3_calls  · 3_agents_create
// Pro  : 30_calls · 30_agents_create
// Team : plan check only (unlimited)

export async function getUserUsage(): Promise<UsageStats> {
  const { userId, has } = await auth()

  if (!userId) {
    return {
      plan: "free", totalCalls: 0,
      callLimit: 3, agentLimit: 3,
      callPercent: 0, agentPercent: 0,
      isAtCallLimit: false, isAtAgentLimit: false,
    }
  }

  // ── Determine plan ────────────────────────────────────────────────────────
  let plan: PlanType = "free"
  let callLimit      = 3
  let agentLimit     = 3

  if (has({ plan: "team" })) {
    plan = "team"
    callLimit  = -1
    agentLimit = -1
  } else if (has({ plan: "pro" })) {
    plan = "pro"
    callLimit  = 30
    agentLimit = 15
  } else if (has({ feature: "30_calls" })) {
    // fallback feature check for pro
    plan = "pro"
    callLimit  = 30
    agentLimit = 15
  } else {
    // free — verify with feature slug
    plan = "free"
    callLimit  = has({ feature: "3_calls" })         ? 3 : 3
    agentLimit = has({ feature: "3_agents_create" }) ? 3 : 3
  }

  // ── Count from DB ─────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(calls)
    .where(eq(calls.userId, userId))

  const totalCalls = Number(total)

  const callPercent  = callLimit  === -1 ? 100 : Math.min(Math.round((totalCalls / callLimit)  * 100), 100)
  const agentPercent = agentLimit === -1 ? 100 : Math.min(Math.round((totalCalls / agentLimit) * 100), 100)

  return {
    plan,
    totalCalls,
    callLimit,
    agentLimit,
    callPercent,
    agentPercent,
    isAtCallLimit:  callLimit  !== -1 && totalCalls >= callLimit,
    isAtAgentLimit: agentLimit !== -1 && totalCalls >= agentLimit,
  }
}

// ─── Gate: can the user create a new call? ────────────────────────────────────
export async function canCreateCall(): Promise<boolean> {
  const { userId, has } = await auth()
  if (!userId) return false

  // team = unlimited
  if (has({ plan: "team" })) return true

  // determine limit by plan then feature
  let limit = 0

  if (has({ plan: "pro" }) || has({ feature: "30_calls" })) {
    limit = 30
  } else if (has({ feature: "3_calls" })) {
    limit = 3
  }

  if (limit === 0) return false // no plan assigned

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(calls)
    .where(eq(calls.userId, userId),
    
)

  return Number(total) < limit
}

// ─── Gate: can the user create a new agent? ───────────────────────────────────
export async function canCreateAgent(): Promise<boolean> {
  const { userId, has } = await auth()
  if (!userId) return false

  if (has({ plan: "team" })) return true

  let limit = 0

  if (has({ plan: "pro" }) || has({ feature: "15_agents_create" })) {
    limit = 15
  } else if (has({ feature: "3_agents_create" })) {
    limit = 3
  }

  if (limit === 0) return false

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(calls)
    .where(eq(calls.userId, userId))

  return Number(total) < limit
}