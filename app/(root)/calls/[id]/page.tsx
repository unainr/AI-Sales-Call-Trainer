import { getCallById } from '@/modules/calls/server/create-call'
import SalesAgentUI from '@/modules/calls/ui/components/sales-call'
import React from 'react'
interface Props {
    params:Promise<{id:string}>
}
const CallPage = async({params}:Props) => {
 const {id} = await params
 const result = await getCallById(id)
if (!result.success || !result.data) {
    return <p className="text-red-500">Call not found or an error occurred.</p>
  }
 return (
   <div className="min-h-screen p-3">
    <SalesAgentUI
    config={result.data}
    />
    </div>
  )
}

export default CallPage