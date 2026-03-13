import { SalesAgentByUser } from "@/modules/calls/server/create-call"
import { CallsList } from "@/modules/calls/ui/components/calls-list"
import { auth } from "@clerk/nextjs/server"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

const DashboardPage = async() => {
    const { userId } = await auth()
  if (!userId) redirect("/sign-in")
 
  const result = await SalesAgentByUser()
 
  // error or unauthorized
  if (!result || "error" in result) redirect("/sign-in")
 
  const calls = result.data
  return (
   <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-20">
      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
 
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
              Sales Trainer
            </p>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Your Sessions
            </h1>
          </div>
          <Link
            href="/calls/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity shrink-0"
          >
            <PlusIcon className="size-3.5" />New Call
          </Link>
        </div>
 
        {/* Calls grid */}
        <CallsList calls={calls} />
 
      </div>
    </main>
  )
}

export default DashboardPage