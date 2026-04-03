import UserNotFound from '@/components/user-not-found'
import { getCallById } from '@/modules/calls/server/create-call'
import SalesAgentUI from '@/modules/calls/ui/components/sales-call'
import { currentUser } from '@clerk/nextjs/server'
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
    return <p className="text-red-500">Call not found or an error occurred.</p>
  }
  if (result.error === 'limit_reached') redirect("/pricing")
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