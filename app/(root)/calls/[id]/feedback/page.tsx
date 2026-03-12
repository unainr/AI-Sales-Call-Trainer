// app/calls/[id]/feedback/page.tsx
import { notFound, redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  CheckCircle2Icon, XCircleIcon, AlertCircleIcon,
  ZapIcon, TrendingUpIcon, ArrowLeftIcon, RotateCcwIcon,
  ClockIcon, ChevronDownIcon,
} from "lucide-react"
import { getCall, getCallById } from "@/modules/calls/server/create-call"
import { AutoRefresh } from "@/modules/calls/ui/components/auto-refresh"

type FeedbackResult = {
  summary:      string
  strengths:    string[]
  improvements: string[]
  outcome:      "success" | "partial" | "failed"
  tip:          string
}

function formatDuration(s: number | null) {
  if (!s) return null
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function OutcomeBadge({ outcome }: { outcome: FeedbackResult["outcome"] }) {
  const map = {
    success: { icon: CheckCircle2Icon, label: "Goal Achieved", cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/20" },
    partial: { icon: AlertCircleIcon,  label: "Partially Met", cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/20" },
    failed:  { icon: XCircleIcon,      label: "Goal Not Met",  cls: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-red-200 dark:ring-red-500/20" },
  }
  const { icon: Icon, label, cls } = map[outcome]
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ring-1", cls)}>
      <Icon className="size-3.5" />{label}
    </div>
  )
}

function TranscriptSection({ transcript, productName }: { transcript: string; productName: string }) {
  const lines = transcript.split("\n").filter(Boolean)
  return (
    <details className="rounded-2xl overflow-hidden group ring-1 ring-black/6 dark:ring-white/6">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none bg-zinc-50 dark:bg-zinc-900 hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
        <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">Full Transcript</span>
        <ChevronDownIcon className="size-4 text-zinc-400 group-open:rotate-180 transition-transform duration-200" />
      </summary>
      <div className="px-5 py-4 flex flex-col gap-3 max-h-96 overflow-y-auto bg-white dark:bg-zinc-900 border-t border-black/5 dark:border-white/5" style={{ scrollbarWidth: "thin" }}>
        {lines.map((line, i) => {
          const isRep = line.startsWith("Rep:")
          const text  = line.replace(/^(Rep|Prospect):\s*/, "")
          return (
            <div key={i} className={cn("flex flex-col gap-0.5", isRep ? "items-end" : "items-start")}>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                {isRep ? "You" : productName}
              </span>
              <div className={cn(
                "max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                isRep
                  ? "bg-zinc-900 dark:bg-zinc-700 text-white rounded-tr-lg"
                  : "bg-zinc-100 dark:bg-white/[0.07] text-zinc-700 dark:text-zinc-200 rounded-tl-lg"
              )}>
                {text}
              </div>
            </div>
          )
        })}
      </div>
    </details>
  )
}

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const  user  = await currentUser()
  if(!user?.id) return <div className="flex flex-col items-center justify-center text-red-300 min-h-screen">User not found or an error occurred.</div>
console.log(user?.id)
  const { id } = await params
  const call = await getCall(id)
  console.log(call)
  if (!call) return <div className="flex flex-col items-center justify-center text-red-600 min-h-screen">call not found or an error occurred.</div>

  // Webhook hasn't saved feedback yet — poll every 3s
  if (call.status !== "completed" || !call.feedback) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <AutoRefresh />
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900 dark:border-t-white animate-spin" />
          </div>
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100 text-lg">Analysing your call…</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5">
              Your AI coach is reviewing the transcript. This takes about 15 seconds.
            </p>
          </div>
        </div>
      </main>
    )
  }

  let feedback: FeedbackResult | null = null
  try { feedback = JSON.parse(call.feedback) } catch { /* ignore */ }

  const duration = formatDuration(call.durationSeconds)
  const card = cn("rounded-2xl p-5 bg-white dark:bg-zinc-900 ring-1 ring-black/[0.06] dark:ring-white/[0.06] shadow-sm")

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">

        {/* Back */}
        <Link href="/dashboard" className="self-start flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-1">
          <ArrowLeftIcon className="size-3.5" />Dashboard
        </Link>

        {/* Header */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
            Session Complete
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {call.productName}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-sm text-zinc-400 dark:text-zinc-500 capitalize">
              {call.industry.replace(/_/g, " ")} · {call.difficulty} · {call.yourRole.replace(/_/g, " ")}
            </span>
            {duration && (
              <span className="flex items-center gap-1 text-sm text-zinc-400 dark:text-zinc-500">
                <ClockIcon className="size-3" />{duration}
              </span>
            )}
            {feedback && <OutcomeBadge outcome={feedback.outcome} />}
          </div>
        </div>

        {feedback ? (
          <>
            {/* Summary */}
            <div className={card}>
              <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {feedback.summary}
              </p>
            </div>

            {/* Strengths */}
            <div className={card}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUpIcon className="size-3.5 text-emerald-500" />
                </div>
                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
                  What Went Well
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className={card}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <AlertCircleIcon className="size-3.5 text-amber-500" />
                </div>
                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
                  Areas to Improve
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircleIcon className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coach tip */}
            <div className="rounded-2xl p-5 flex gap-4 bg-zinc-900 dark:bg-zinc-800 ring-1 ring-black/10 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <ZapIcon className="size-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Coach's Tip</p>
                <p className="text-[13px] text-white/85 leading-relaxed">{feedback.tip}</p>
              </div>
            </div>
          </>
        ) : (
          <div className={cn(card, "text-center text-sm text-zinc-400 py-10")}>
            Feedback unavailable for this session.
          </div>
        )}

        {/* Transcript */}
        {call.transcript && (
          <TranscriptSection transcript={call.transcript} productName={call.productName} />
        )}

        {/* CTAs */}
        <div className="flex gap-3 pt-2 pb-6">
          <Link href="/calls/new" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:opacity-90 transition-opacity">
            <RotateCcwIcon className="size-3.5" />Practice Again
          </Link>
          <Link href="/dashboard" className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-[13px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
            Dashboard
          </Link>
        </div>

      </div>
    </main>
  )
}