import {
	boolean,
	integer,
	json,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	primaryKey,
	pgEnum,
} from "drizzle-orm/pg-core";


// Enums===============
export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const callStatusEnum = pgEnum("call_status", [
  "pending",
  "active",
  "completed",
  "failed",
]);

export const industryEnum = pgEnum("industry", [
  "saas_software",
  "hr_tech",
  "fintech",
  "ecommerce",
  "healthcare",
  "real_estate",
  "marketing_adtech",
  "education",
  "logistics",
  "cybersecurity",
  "other",
]);

export const callGoalEnum = pgEnum("call_goal", [
  "book_discovery_call",
  "close_demo",
  "overcome_objection",
  "practice_cold_open",
  "full_sales_cycle",
]);

export const yourRoleEnum = pgEnum("your_role", [
  "account_executive",
  "sales_development_rep",
  "business_development_rep",
  "founder",
  "freelancer",
  "sales_manager",
]);

// =======================
// Call
// =======================
export const calls = pgTable("calls", {
	id: uuid("id").primaryKey().defaultRandom(),
 productName:  text("product_name").notNull(),
  industry:     industryEnum("industry").notNull(),
  difficulty:   difficultyEnum("difficulty").notNull(),
  yourRole:     yourRoleEnum("your_role").notNull(),
  callGoal:     callGoalEnum("call_goal").notNull(),

  // ── Vapi data (filled during / after call) ──
  vapiCallId:      text("vapi_call_id").unique(),
  status:          callStatusEnum("status").default("pending").notNull(),
  durationSeconds: integer("duration_seconds"),
  transcript:      text("transcript"),
  feedback:        text("feedback"),
  score:           integer("score"),

  startedAt: timestamp("started_at"),
  endedAt:   timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Call    = typeof calls.$inferSelect;
export type NewCall = typeof calls.$inferInsert;

export const INDUSTRY_LABELS: Record<string, string> = {
  saas_software:    "SaaS / Software",
  hr_tech:          "HR Tech",
  fintech:          "FinTech",
  ecommerce:        "E-commerce",
  healthcare:       "Healthcare",
  real_estate:      "Real Estate",
  marketing_adtech: "Marketing / AdTech",
  education:        "Education",
  logistics:        "Logistics",
  cybersecurity:    "Cybersecurity",
  other:            "Other",
};

export const CALL_GOAL_LABELS: Record<string, string> = {
  book_discovery_call: "📅 Book a Discovery Call",
  close_demo:          "🎯 Close a Demo",
  overcome_objection:  "🛡️ Overcome an Objection",
  practice_cold_open:  "🧊 Practice Cold Open Only",
  full_sales_cycle:    "🔄 Full Sales Cycle",
};

export const YOUR_ROLE_LABELS: Record<string, string> = {
  account_executive:        "Account Executive",
  sales_development_rep:    "Sales Development Rep (SDR)",
  business_development_rep: "Business Development Rep (BDR)",
  founder:                  "Founder",
  freelancer:               "Freelancer",
  sales_manager:            "Sales Manager",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy:   "🟢 Easy — Warm lead, open to listening",
  medium: "🟡 Medium — Has a competitor, needs convincing",
  hard:   "🔴 Hard — Skeptical executive, tough objections",
};


