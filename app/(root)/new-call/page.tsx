import { CallForm } from "@/modules/calls/ui/components/call-form"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const NewCallPage = async() => {
  const { userId } = await auth()
    if (!userId) redirect("/sign-in")
  return (
    <div className="py-20">
        <CallForm />

    </div>
  )
}

export default NewCallPage