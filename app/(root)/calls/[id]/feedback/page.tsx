// app/calls/[id]/feedback/page.tsx
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  CheckCircle2Icon, XCircleIcon, AlertCircleIcon,
  ZapIcon, TrendingUpIcon, ArrowLeftIcon, RotateCcwIcon,
  ClockIcon, ChevronDownIcon, MicIcon, BarChart2Icon,
} from "lucide-react"
import { getCall } from "@/modules/calls/server/create-call"
import { GenerateFeedbackButton } from "@/modules/calls/ui/components/auto-refresh"
import UserNotFound from "@/components/user-not-found"

// ─── Types ────────────────────────────────────────────────────────────────────
type Outcome = "success" | "partial" | "failed"
type FeedbackResult = {
  summary:      string
  strengths:    string[]
  improvements: string[]
  outcome:      Outcome
  tip:          string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(s: number | null) {
  if (!s) return null
  const m   = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function parseFeedback(raw: string | null): FeedbackResult | null {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// ─── Outcome config ───────────────────────────────────────────────────────────
const OUTCOME_MAP: Record<Outcome, {
  label: string; dot: string; badge: string; bar: string
}> = {
  success: {
    label: "Deal Closed",
    dot:   "bg-emerald-500",
    badge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    bar:   "bg-emerald-500",
  },
  partial: {
    label: "Partial Win",
    dot:   "bg-amber-500",
    badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    bar:   "bg-amber-500",
  },
  failed: {
    label: "No Result",
    dot:   "bg-rose-500",
    badge: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
    bar:   "bg-rose-500",
  },
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ outcome }: { outcome: Outcome }) {
  const scores: Record<Outcome, { pct: number; color: string; label: string }> = {
    success: { pct: 92, color: "#10b981", label: "92" },
    partial: { pct: 58, color: "#f59e0b", label: "58" },
    failed:  { pct: 24, color: "#f43f5e", label: "24" },
  }
  const { pct, color, label } = scores[outcome]
  const r    = 34
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }}>
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="44" cy="44" r={r} fill="none" strokeWidth="6"
          className="stroke-zinc-100 dark:stroke-zinc-800" />
        <circle cx="44" cy="44" r={r} fill="none" strokeWidth="6"
          stroke={color} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-[20px] font-bold text-zinc-900 dark:text-zinc-50">{label}</span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">score</span>
      </div>
    </div>
  )
}

// ─── Outcome badge ────────────────────────────────────────────────────────────
function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const { label, dot, badge } = OUTCOME_MAP[outcome]
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
      badge
    )}>
      <span className={cn("size-1.5 rounded-full shrink-0", dot)} />
      {label}
    </span>
  )
}

// ─── Transcript accordion ─────────────────────────────────────────────────────
function TranscriptSection({ transcript, productName }: {
  transcript: string; productName: string
}) {
  const lines = transcript.split("\n").filter(Boolean)

  return (
    <details className="group rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <MicIcon className="size-3.5 text-zinc-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Transcript
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
            {lines.length} lines
          </span>
        </div>
        <ChevronDownIcon className="size-4 text-zinc-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="border-t border-black/5 dark:border-white/5 p-4 flex flex-col gap-2.5 max-h-80 overflow-y-auto"
        style={{ scrollbarWidth: "thin" }}>
        {lines.map((line, i) => {
          const isRep = line.startsWith("Rep:")
          const text  = line.replace(/^(Rep|Prospect|AI):\s*/, "")
          return (
            <div key={i} className={cn("flex flex-col gap-0.5", isRep ? "items-end" : "items-start")}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
                {isRep ? "You" : productName}
              </span>
              <div className={cn(
                "max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                isRep
                  ? "bg-zinc-900 dark:bg-zinc-700 text-white rounded-tr-[5px]"
                  : "bg-zinc-100 dark:bg-white/[0.07] text-zinc-700 dark:text-zinc-200 rounded-tl-[5px]"
              )}>
                {text || line}
              </div>
            </div>
          )
        })}
      </div>
    </details>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const FeedbackPage= async({ params }: { params: Promise<{ id: string }> })=> {
  const { userId } = await auth()
  if (!userId) return <UserNotFound />

  const { id } = await params
  const call   = await getCall(id)
  if (!call) redirect("/dashboard")

  // ── Not generated yet ─────────────────────────────────────────────────────
  if (call.status !== "completed" || !call.feedback) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-xs w-full">

          <div className="size-16 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg">
            <MicIcon className="size-7 text-white dark:text-zinc-900" />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Call Complete
            </p>
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500">
              Your AI coach is ready to review your performance
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {[call.productName, call.difficulty, call.industry.replace(/_/g, " ")].map(tag => (
              <span key={tag}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 capitalize">
                {tag}
              </span>
            ))}
          </div>

          <GenerateFeedbackButton callId={call.id} vapiCallId={call.vapiCallId!} />

          <Link href="/dashboard"
            className="text-[12px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Skip → Dashboard
          </Link>
        </div>
      </main>
    )
  }

  // ── Feedback ready ────────────────────────────────────────────────────────
  const feedback = parseFeedback(call.feedback)
  const duration = formatDuration(call.durationSeconds)
  const outcome  = feedback?.outcome ?? "partial"
  const outcfg   = OUTCOME_MAP[outcome]

  const card = "rounded-2xl p-5 bg-white dark:bg-zinc-900 ring-1 ring-black/[0.06] dark:ring-white/[0.06]"

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* Outcome accent bar */}

      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col gap-4">
      <div className={cn("h-1 w-full", outcfg.bar)} />

        {/* ── Hero card ── */}
        <div className={card}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                Session Complete
              </p>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight truncate">
                {call.productName}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  call.industry.replace(/_/g, " "),
                  call.difficulty,
                  call.yourRole.replace(/_/g, " "),
                  call.callGoal.replace(/_/g, " "),
                ].map(tag => (
                  <span key={tag}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 capitalize">
                    {tag}
                  </span>
                ))}
                {duration && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <ClockIcon className="size-3" />{duration}
                  </span>
                )}
              </div>
            </div>

            {feedback && (
              <div className="flex flex-col items-center gap-2 shrink-0">
                <ScoreRing outcome={outcome} />
                <OutcomeBadge outcome={outcome} />
              </div>
            )}
          </div>
        </div>

        {/* ── Recording ── */}
        {call.recordingUrl && (
          <div className={card}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
              Call Recording
            </p>
            <audio controls src={call.recordingUrl}
              className="w-full h-10 accent-zinc-900 dark:accent-white" />
          </div>
        )}

        {feedback ? (
          <>
            {/* Summary */}
            <div className={card}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2Icon className="size-3.5 text-zinc-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Summary
                </p>
              </div>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {feedback.summary}
              </p>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={card}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUpIcon className="size-3.5 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    What Went Well
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={card}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <AlertCircleIcon className="size-3.5 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    Areas to Improve
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <XCircleIcon className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coach tip */}
            <div className="rounded-2xl p-5 flex gap-4 bg-zinc-900 dark:bg-zinc-800 ring-1 ring-black/10">
              <div className="size-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                <ZapIcon className="size-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                  Coach's Tip
                </p>
                <p className="text-[13px] text-white/75 leading-relaxed">{feedback.tip}</p>
              </div>
            </div>
          </>
        ) : (
          <div className={cn(card, "text-center text-[13px] text-zinc-400 py-12")}>
            Feedback unavailable for this session.
          </div>
        )}

        {/* Transcript */}
        {call.transcript && (
          <TranscriptSection transcript={call.transcript} productName={call.productName} />
        )}

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2 pb-8">
          <Link href="/calls/new"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold bg-white dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <RotateCcwIcon className="size-3.5" />Practice Again
          </Link>
          <Link href="/dashboard"
            className="flex items-center justify-center py-3 rounded-xl text-[13px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
            Dashboard
          </Link>
        </div>

      </div>
    </main>
  )
}

export default FeedbackPage
