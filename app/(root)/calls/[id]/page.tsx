import UserNotFound from '@/components/user-not-found'
import { getCallById } from '@/modules/calls/server/create-call'
import SalesAgentUI from '@/modules/calls/ui/components/sales-call'
import { currentUser } from '@clerk/nextjs/server'
import { AlertCircleIcon, ArrowRightIcon, CrownIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
interface Props {
    params:Promise<{id:string}>
}
const CallPage = async({params}:Props) => {
 const {id} = await params
 const result = await getCallById(id)
 const user = await currentUser();
 if(!user) return redirect("/sign-in")
if (!result.success || !result.data) {
  if (result.error === 'limit_reached') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-border/60 bg-background overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <CrownIcon className="size-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Call Limit Reached</h2>
              <p className="text-sm text-muted-foreground">
                You've used all your calls on the free plan. Upgrade to keep practicing.
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors"
            >
              <ArrowRightIcon className="size-3.5" /> Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircleIcon className="size-4 text-red-500" />
        Call not found or an error occurred.
      </div>
    </div>
  )
}
 return (
   <div className="min-h-screen p-3 py-20">
    <SalesAgentUI
    id={id}
    userName={user?.firstName}
    imageUrl={user?.imageUrl}
    config={result.data}
    />
    </div>
  )
}

export default CallPage