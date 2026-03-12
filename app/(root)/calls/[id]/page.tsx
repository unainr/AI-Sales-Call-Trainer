import { getCallById } from '@/modules/calls/server/create-call'
import SalesAgentUI from '@/modules/calls/ui/components/sales-call'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
interface Props {
    params:Promise<{id:string}>
}
const CallPage = async({params}:Props) => {
 const {id} = await params
 const result = await getCallById(id)
 const user = await currentUser();
 if(!user) return <div className="flex flex-col text-red-500 min-h-screen">User not found or an error occurred.</div>
if (!result.success || !result.data) {
    return <p className="text-red-500">Call not found or an error occurred.</p>
  }
 return (
   <div className="min-h-screen p-3 py-20">
    <SalesAgentUI
    userName={user?.firstName}
    imageUrl={user?.imageUrl}
    config={result.data}
    />
    </div>
  )
}

export default CallPage