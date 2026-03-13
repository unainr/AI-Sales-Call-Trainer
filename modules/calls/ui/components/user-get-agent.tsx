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

// ─── Label maps ───────────────────────────────────────────────────────────────
const DIFFICULTY: Record<string, { label: string; pill: string; bar: string }> = {
  easy:   { label: "Easy",   pill: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-400" },
  medium: { label: "Medium", pill: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",         bar: "bg-amber-400"   },
  hard:   { label: "Hard",   pill: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",             bar: "bg-rose-400"    },
}

const GOAL_LABEL: Record<string, string> = {
  book_discovery_call: "Book Discovery Call",
  close_demo:          "Close a Demo",
  overcome_objection:  "Overcome Objection",
  practice_cold_open:  "Cold Open Practice",
  full_sales_cycle:    "Full Sales Cycle",
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({
  productName,
  onConfirm,
  onCancel,
  loading,
}: {
  productName: string
  onConfirm:  () => void
  onCancel:   () => void
  loading:    boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/8 dark:ring-white/8 p-6 flex flex-col gap-5"
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
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {productName}
            </span>{" "}
            and all its feedback will be permanently deleted. This cannot be undone.
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
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white transition-colors disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Call Card ────────────────────────────────────────────────────────────────
export function CallCard({ call }: { call: CallRow }) {
  const [showDialog, setShowDialog] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const diff       = DIFFICULTY[call.difficulty] ?? DIFFICULTY.medium
  const goalLabel  = GOAL_LABEL[call.callGoal]   ?? call.callGoal.replace(/_/g, " ")
  const hasFeedback = call.status === "completed" && !!call.feedback

  async function handleDelete() {
    setDeleting(true)
    await deleteCall(call.id)
    setDeleting(false)
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

      <div className="group flex flex-col rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 hover:ring-black/10 dark:hover:ring-white/10 hover:shadow-md transition-all duration-200 overflow-hidden">

        {/* Difficulty colour strip */}
        <div className={cn("h-0.75 w-full shrink-0", diff.bar)} />

        <div className="flex flex-col flex-1 p-5 gap-4">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <h3 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-50 truncate leading-snug">
                {call.productName}
              </h3>
              <span className={cn(
                "self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                diff.pill
              )}>
                {diff.label}
              </span>
            </div>

            {/* Delete — appears on hover */}
            <button
              onClick={() => setShowDialog(true)}
              className="size-8 rounded-xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>

          {/* ── Info rows ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <BuildingIcon className="size-3 text-zinc-400" />
              </div>
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400 capitalize leading-none">
                {call.industry.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <UserIcon className="size-3 text-zinc-400" />
              </div>
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400 capitalize leading-none">
                {call.yourRole.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <TargetIcon className="size-3 text-zinc-400" />
              </div>
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-none">
                {goalLabel}
              </span>
            </div>
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1" />

          {/* ── Divider ── */}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* ── Buttons ── */}
          <div className="grid grid-cols-2 gap-2">
            {/* Start Call */}
            <Link
              href={`/calls/${call.id}`}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-85 active:opacity-75 transition-opacity"
            >
              <PhoneIcon className="size-3.5" />
              Start Call
            </Link>

            {/* View Feedback */}
            {hasFeedback ? (
              <Link
                href={`/calls/${call.id}/feedback`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <MessageSquareIcon className="size-3.5" />
                Feedback
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold bg-zinc-50 dark:bg-zinc-800/40 text-zinc-300 dark:text-zinc-600 cursor-not-allowed select-none">
                <MessageSquareIcon className="size-3.5" />
                Feedback
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}