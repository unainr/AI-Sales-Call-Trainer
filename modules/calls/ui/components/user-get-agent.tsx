// modules/dashboard/ui/components/call-card.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import {
  PhoneIcon, MessageSquareIcon, Trash2Icon,
  BuildingIcon, TargetIcon, UserIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CallRow, deleteCall } from "../../server/create-call"
import { useRouter } from "next/navigation"

// ─── Config ───────────────────────────────────────────────────────────────────
const DIFFICULTY: Record<string, {
  label: string; pill: string; dot: string; bar: string; orb: string; waveColor: string
}> = {
  easy: {
    label: "Easy",
    pill: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    dot:  "bg-emerald-500",
    bar:  "from-emerald-400 via-emerald-500 to-emerald-300",
    orb:  "bg-emerald-400",
    waveColor: "#10b981",
  },
  medium: {
    label: "Medium",
    pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot:  "bg-amber-400",
    bar:  "from-amber-400 via-amber-500 to-amber-300",
    orb:  "bg-amber-400",
    waveColor: "#f59e0b",
  },
  hard: {
    label: "Hard",
    pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dot:  "bg-rose-500",
    bar:  "from-rose-400 via-rose-500 to-rose-300",
    orb:  "bg-rose-400",
    waveColor: "#ef4444",
  },
}

const GOAL_LABEL: Record<string, string> = {
  book_discovery_call: "Book Discovery Call",
  close_demo:          "Close a Demo",
  overcome_objection:  "Overcome Objection",
  practice_cold_open:  "Cold Open Practice",
  full_sales_cycle:    "Full Sales Cycle",
}

const WAVE_H = [8,14,20,10,24,16,12,22,18,8,16,24,10,20,14,22,12,18,24,10,16,8]

// ─── Subcomponents ────────────────────────────────────────────────────────────
function WaveStrip({ color }: { color?: string }) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {WAVE_H.map((h, i) => (
        <div
          key={i}
          style={{
            height: h,
            width: "2.5px",
            borderRadius: "999px",
            background: color ?? "rgba(255,255,255,0.25)",
            opacity: 0.7,
            transformOrigin: "bottom",
            animation: `pulse-bar ${(0.4 + (i % 5) * 0.12).toFixed(2)}s ease-in-out ${(i * 0.04).toFixed(2)}s infinite alternate`,
          }}
        />
      ))}
    </div>
  )
}
function Chip({ icon: Icon, text, className }: {
  icon: React.ElementType
  text: string
  className?: string
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px]",
      "bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/8",
      "backdrop-blur-sm",
      className
    )}>
      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 capitalize truncate leading-none">
        {text}
      </span>
    </div>
  )
}

function DeleteDialog({
  productName, onConfirm, onCancel, loading,
}: {
  productName: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="size-11 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
          <Trash2Icon className="size-5 text-rose-500" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-50">
            Delete this session?
          </p>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{productName}</span>{" "}
            and all its feedback will be permanently removed.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-500 hover:bg-rose-400 text-white transition-colors disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Card ────────────────────────────────────────────────────────────────
export function CallCard({ call }: { call: CallRow }) {
  const [showDialog, setShowDialog] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const router = useRouter()

  const diff       = DIFFICULTY[call.difficulty] ?? DIFFICULTY.medium
  const goalLabel  = GOAL_LABEL[call.callGoal]   ?? call.callGoal.replace(/_/g, " ")
  const hasFeedback = call.status === "completed" && !!call.feedback


  async function handleDelete() {
    setDeleting(true)
    await deleteCall(call.id)
    setDeleting(false)
    router.refresh()
    setShowDialog(false)
  }

  return (
    <>
      {showDialog && (
        <DeleteDialog
          productName={call.productName}
          onConfirm={handleDelete}
          onCancel={() => setShowDialog(false)}
          loading={deleting}
        />
      )}

      {/* ── Card shell — glassmorphic ── */}
      <div className={cn(
        "group relative flex flex-col rounded-4xl overflow-hidden",
        "bg-white/55 dark:bg-zinc-900/55",
        "border border-white/70 dark:border-white/8",
        "backdrop-blur-[18px]",
        "shadow-[0_8px_32px_rgba(80,100,160,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
        "hover:-translate-y-0.75 hover:shadow-[0_16px_48px_rgba(80,100,180,0.14)]",
        "dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]",
        "transition-all duration-200 cursor-pointer"
      )}>

        {/* Difficulty gradient bar */}
        <div className={cn("h-[2.5px] w-full shrink-0 bg-linear-to-r", diff.bar)} />

        {/* Ambient orb */}
        <div className={cn(
          "absolute -top-8 -right-8 w-22.5 h-22.5 rounded-full blur-[20px] opacity-[0.07] pointer-events-none",
          diff.orb
        )} />

        <div className="relative flex flex-col flex-1 p-4.25 gap-3">

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.75 flex-1 min-w-0">
              <h3
                className="text-[16px] text-zinc-900 dark:text-zinc-50 truncate leading-snug"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                {call.productName}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.07em] px-2.5 py-0.75 rounded-full",
                  diff.pill
                )}>
                  <span className={cn("size-1.25 rounded-full shrink-0", diff.dot)} />
                  {diff.label}
                </span>
              
              </div>
            </div>
            <button
              onClick={() => setShowDialog(true)}
              className="size-7 rounded-xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
            >
              <Trash2Icon className="size-3.25" />
            </button>
          </div>

          {/* Meta chips */}
          <div className="grid grid-cols-2 gap-1.25">
            <Chip icon={BuildingIcon} text={call.industry.replace(/_/g, " ")} />
            <Chip icon={UserIcon}     text={call.yourRole.replace(/_/g, " ")} />
            <Chip icon={TargetIcon}   text={goalLabel} className="col-span-2" />
          </div>

          {/* Waveform */}
          <WaveStrip color={diff.waveColor} />

          <div className="flex-1" />

          {/* Divider */}
          <div className="h-px bg-white/20 dark:bg-white/6" />

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-1.75">
            <Link
              href={`/calls/${call.id}`}
              className={cn(
                "flex items-center justify-center gap-1.25 py-2.5 rounded-[11px]",
                "text-[12px] font-semibold",
                "bg-red-500 dark:bg-red-500",
                "hover:opacity-80 active:opacity-70 transition-opacity"
              )}
            >
              <PhoneIcon className="size-3" strokeWidth={2.5} />
              Start Call
            </Link>

            {hasFeedback ? (
              <Link
                href={`/calls/${call.id}/feedback`}
                className={cn(
                  "flex items-center justify-center gap-1.25 py-2.5 rounded-[11px]",
                  "text-[12px] font-semibold",
                  "bg-red-500 dark:bg-red-500",
                  "backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                )}
              >
                <MessageSquareIcon className="size-3" strokeWidth={2} />
                Feedback
              </Link>
            ) : (
              <div className={cn(
                "flex items-center justify-center gap-1.25 py-2.5 rounded-[11px]",
                "text-[12px] font-semibold",
                "bg-red-500 dark:bg-red-700",
                "border border-white/20 dark:border-white/5",
                "cursor-not-allowed select-none opacity-50"
              )}>
                <MessageSquareIcon className="size-3" strokeWidth={2} />
                Feedback
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}