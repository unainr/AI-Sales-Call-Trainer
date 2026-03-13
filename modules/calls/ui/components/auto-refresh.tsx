// modules/calls/ui/components/generate-feedback-button.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, SparklesIcon } from "lucide-react"
import { generateFeedback } from "@/modules/calls/server/create-call"

type Props = {
  callId:     string
  vapiCallId: string
}

export function GenerateFeedbackButton({ callId, vapiCallId }: Props) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const handleGenerate = async () => {
    setLoading(true)
    setError("")

    const result = await generateFeedback(callId, vapiCallId)
    console.log(callId, vapiCallId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Reload the page — server component will now see status=completed
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
          bg-zinc-900 dark:bg-white text-white dark:text-zinc-900
          font-semibold text-[13px] shadow-md
          hover:opacity-90 active:opacity-80
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-opacity"
      >
        {loading ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Analysing your call…
          </>
        ) : (
          <>
            <SparklesIcon className="size-4" />
            Generate Feedback
          </>
        )}
      </button>

      {error && (
        <p className="text-[13px] text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}