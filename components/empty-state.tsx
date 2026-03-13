// modules/dashboard/ui/components/empty-state.tsx
import Link from "next/link"
import { MicIcon, PlusIcon } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <MicIcon className="size-7 text-zinc-400 dark:text-zinc-500" />
      </div>
      <div className="flex flex-col gap-1.5 max-w-65">
        <p className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-200">
          No sessions yet
        </p>
        <p className="text-[13px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
          Create your first practice call and get AI feedback on your sales technique.
        </p>
      </div>
      <Link
        href="/calls/new"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
      >
        <PlusIcon className="size-3.5" />New Session
      </Link>
    </div>
  )
}