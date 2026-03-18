// modules/billing/ui/components/usage-card.tsx
import Link from "next/link"
import { PhoneIcon, BotIcon, ArrowRightIcon, CheckCircle2Icon, CrownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { UsageStats } from "../../server/pricing";

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free: { label: "Free", cls: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" },
  pro:  { label: "Pro",  cls: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"   },
  team: { label: "Team", cls: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"   },
}

function ProgressBar({ pct, unlimited }: { pct: number; unlimited: boolean }) {
  const color =
    unlimited ? "bg-emerald-500" :
    pct >= 90 ? "bg-red-500"     :
    pct >= 65 ? "bg-amber-500"   :
                "bg-red-400"

  return (
    <div className="w-full h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: unlimited ? "100%" : `${pct}%` }}
      />
    </div>
  )
}

function UsageRow({ icon: Icon, label, used, limit, pct }: {
  icon: typeof PhoneIcon; label: string
  used: number; limit: number; pct: number
}) {
  const unlimited = limit === -1
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="size-3 text-zinc-400" />
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</span>
        </div>
        <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
          {unlimited
            ? <span className="text-emerald-500">Unlimited</span>
            : <>{used}<span className="font-normal text-zinc-400"> / {limit}</span></>
          }
        </span>
      </div>
      <ProgressBar pct={pct} unlimited={unlimited} />
    </div>
  )
}

export function UsageCard({ usage }: { usage: UsageStats }) {
  const badge     = PLAN_BADGE[usage.plan]
  const isPaid    = usage.plan === "pro" || usage.plan === "team"
  const isAtLimit = usage.isAtCallLimit || usage.isAtAgentLimit
  const remaining = usage.callLimit === -1 ? null : usage.callLimit - usage.totalCalls

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <CrownIcon className="size-3.5 text-zinc-400" />
          <p className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">
            Plan Usage
          </p>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
          badge.cls
        )}>
          {badge.label}
        </span>
      </div>

      {/* Usage rows */}
      <div className="px-4 py-3.5 flex flex-col gap-3.5">
        <UsageRow
          icon={PhoneIcon} label="Calls"
          used={usage.totalCalls} limit={usage.callLimit} pct={usage.callPercent}
        />
        <UsageRow
          icon={BotIcon} label="Agents"
          used={usage.totalCalls} limit={usage.agentLimit} pct={usage.agentPercent}
        />
      </div>

      {/* Free — upgrade CTA */}
      {!isPaid && (
        <div className={cn(
          "mx-3 mb-3 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3",
          isAtLimit
            ? "bg-red-50 dark:bg-red-500/10 ring-1 ring-red-200 dark:ring-red-500/20"
            : "bg-zinc-50 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700"
        )}>
          <p className={cn(
            "text-[11px] font-medium",
            isAtLimit ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
          )}>
            {isAtLimit
              ? "Limit reached — upgrade to continue"
              : `${remaining} ${remaining === 1 ? "call" : "calls"} left on free plan`
            }
          </p>
          <Link
            href="/pricing"
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-500 hover:bg-red-400 text-white transition-colors"
          >
            Upgrade <ArrowRightIcon className="size-2.5" />
          </Link>
        </div>
      )}

      {/* Paid — active */}
      {isPaid && (
        <div className="mx-3 mb-3 rounded-xl px-3.5 py-2.5 flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-200 dark:ring-emerald-500/20">
          <div className="flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3.5 text-emerald-500" />
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {usage.plan === "team" ? "Team plan active" : "Pro plan active"}
            </p>
          </div>
          <Link
            href="/pricing"
            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:opacity-75 transition-opacity flex items-center gap-1"
          >
            Manage <ArrowRightIcon className="size-2.5" />
          </Link>
        </div>
      )}
    </div>
  )
}