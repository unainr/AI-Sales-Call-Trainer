"use client"

import React, { useCallback, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2Icon, PhoneIcon, PhoneOffIcon, MicIcon, Clock } from "lucide-react"
import Image from "next/image"
// CHANGE 1: import useRouter for redirect after call ends
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SalesTrainerConfig } from "@/lib/assistant"
import { useVapiAgent } from "../../hooks/use-vapi-agent"
import { Orb } from "@/components/ui/orb"
import { ShimmeringText } from "@/components/ui/shimmering-text"

// CHANGE 2: add `id` as a separate prop (the DB row id)
// Do NOT put id inside config — SalesTrainerConfig does not have it
type Props = {
  config:   SalesTrainerConfig
  id:       string        // <- DB row id, passed from the call page
  userName: string | null
  imageUrl: string | null
}

/* --- Call Timer ----------------------------------------- */
function CallTimer() {
  const [seconds, setSeconds] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return <span className="tabular-nums">{m}:{s}</span>
}

/* --- Sound bars ----------------------------------------- */
function SoundBars({ color = "currentColor" }: { color?: string }) {
  return (
    <span className="flex gap-0.75 items-end h-3.5">
      {[0, 0.14, 0.28, 0.14].map((delay, i) => (
        <motion.span
          key={i}
          style={{ backgroundColor: color, width: 3, borderRadius: 99 }}
          animate={{ height: ["3px", "14px", "3px"] }}
          transition={{ duration: 0.85, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      ))}
    </span>
  )
}

/* --- User Avatar ----------------------------------------- */
function UserAvatar({ speaking, size = 88, imageUrl, userName }: {
  speaking: boolean; size?: number; imageUrl: string | null; userName: string | null
}) {
  const initials = userName
    ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {speaking && (
          <>
            {[0, 0.45, 0.9].map((delay) => (
              <motion.div
                key={delay}
                className="absolute rounded-full border border-emerald-400/25"
                initial={{ width: size, height: size, opacity: 0.6 }}
                animate={{ width: size * 1.6, height: size * 1.6, opacity: 0 }}
                transition={{ duration: 1.9, repeat: Infinity, delay, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      <div
        className={cn(
          "relative rounded-full overflow-hidden transition-all duration-500 ring-2",
          speaking ? "ring-emerald-400/50 shadow-[0_0_18px_rgba(52,211,153,0.12)]" : "ring-black/8 dark:ring-white/10 shadow-md"
        )}
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          <Image src={imageUrl ?? ""} alt={userName ?? "You"} fill className="object-cover" sizes={`${size}px`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-[15px]">
            {initials}
          </div>
        )}
        <div className={cn(
          "absolute bottom-1 right-1 size-3.5 rounded-full ring-2 transition-colors duration-300",
          "ring-white dark:ring-zinc-900",
          speaking ? "bg-emerald-400" : "bg-zinc-300 dark:bg-zinc-600"
        )} />
      </div>
    </div>
  )
}

/* --- Typing cursor --------------------------------------- */
function TypingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.7, repeat: Infinity }}
      className="inline-block ml-0.5 w-0.5 h-3 bg-current rounded-full align-middle opacity-50"
    />
  )
}

/* --- Main ----------------------------------------------- */
// CHANGE 3: destructure `id` from props
export default function SalesAgentUI({ config, id, userName, imageUrl }: Props) {
  const router    = useRouter()
  // CHANGE 4: track whether the call was ever active so we detect when it ends
  const wasActive = useRef(false)

  // CHANGE 5: pass `id` as second arg — hook needs it to save vapiCallId to DB
  const { status, start, stop, isActive, messages, liveAssistantText, liveUserText } = useVapiAgent(config, id)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, liveAssistantText, liveUserText])

  // CHANGE 6: redirect to feedback page 3s after call ends
  // 3s delay lets Vapi fire the webhook before we navigate away
  useEffect(() => {
    if (isActive) wasActive.current = true
    if (wasActive.current && !isActive && status === "idle") {
      const t = setTimeout(() => {
        router.push(`/calls/${id}/feedback`)  // <- uses `id` prop, NOT config.id
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [isActive, status, id, router])  // <- `id` in deps, NOT config.id

  const handleCall = useCallback(() => {
    if (status === "idle") start()
    else if (status !== "connecting") stop()
  }, [status, start, stop])

  const isCallActive    = isActive && status !== "connecting"
  const isTransitioning = status === "connecting"
  const isSpeaking      = status === "speaking"
  const isListening     = status === "listening"
  const isThinking      = status === "thinking"
  // CHANGE 7: isEnding = call ended, waiting for redirect — disables button
  const isEnding        = wasActive.current && !isActive && status === "idle"

  const displayName = userName ?? "You"

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-3 w-full">

        {/* LEFT: AI tile */}
        <div className={cn(
          "relative flex-1 min-h-90 rounded-2xl overflow-hidden flex flex-col items-center justify-center",
          "bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 shadow-sm transition-all duration-500",
          isSpeaking && "ring-[1.5px] ring-emerald-400/40 shadow-[0_0_0_4px_rgba(52,211,153,0.05)]"
        )}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,transparent_60%,rgba(0,0,0,0.03)_100%)] dark:bg-[radial-gradient(ellipse_at_80%_20%,transparent_60%,rgba(0,0,0,0.3)_100%)]" />

          <AnimatePresence>
            {isCallActive && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/6 ring-1 ring-black/6 dark:ring-white/[0.07]"
              >
                <Clock className="size-3 text-zinc-400 dark:text-zinc-500" />
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium"><CallTimer /></span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center">
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div className="absolute rounded-full blur-3xl bg-emerald-300/8 dark:bg-emerald-400/[0.07]"
                    initial={{ width: 140, height: 140, opacity: 0 }} animate={{ width: 300, height: 300, opacity: 1 }}
                    exit={{ width: 140, height: 140, opacity: 0 }} transition={{ duration: 0.7 }}
                  />
                )}
              </AnimatePresence>

              <div className={cn(
                "relative size-44 rounded-full transition-all duration-500 ring-2 shadow-xl",
                isSpeaking ? "ring-emerald-400/35 shadow-[0_0_40px_rgba(52,211,153,0.08)]" : "ring-black/[0.07] dark:ring-white/8 shadow-lg"
              )}>
                <div className="h-full w-full rounded-full p-0.75 bg-white/50 dark:bg-white/4">
                  <div className="h-full w-full overflow-hidden rounded-full bg-white/80 dark:bg-zinc-950/80">
                    <Orb className="h-full w-full" />
                  </div>
                </div>
                {isSpeaking && (
                  <>
                    <motion.div className="absolute inset-0 rounded-full border border-emerald-400/30"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }} />
                    <motion.div className="absolute inset-0 rounded-full border border-emerald-400/15"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.45 }} />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[18px] font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">{config.productName}</span>
              <span className="text-[12px] italic text-zinc-400 dark:text-zinc-500">
                {config.industry.replace(/_/g, " ")} · {config.difficulty}
              </span>

              <div className={cn("mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold",
                "bg-black/5 dark:bg-white/6 ring-1 ring-black/6 dark:ring-white/8")}>
                <AnimatePresence mode="wait">
                  {isSpeaking ? (
                    <motion.span key="spk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                      <SoundBars color="#10b981" />Speaking
                    </motion.span>
                  ) : isThinking ? (
                    <motion.span key="thk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
                      <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />Thinking…
                    </motion.span>
                  ) : isTransitioning ? (
                    <motion.span key="con" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                      <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <ShimmeringText text="Connecting…" />
                    </motion.span>
                  ) : isCallActive ? (
                    <motion.span key="lst" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />Listening
                    </motion.span>
                  ) : isEnding ? (
                    // CHANGE 8: "Preparing feedback…" state while waiting for redirect
                    <motion.span key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                      <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-pulse" />Preparing feedback…
                    </motion.span>
                  ) : (
                    <motion.span key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                      <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />Offline
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: User tile + controls */}
        <div className="flex flex-col gap-3 w-52.5 shrink-0">
          <div className={cn(
            "relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3 py-6 px-4",
            "bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 shadow-sm transition-all duration-500",
            isListening && "ring-[1.5px] ring-emerald-400/40 shadow-[0_0_0_4px_rgba(52,211,153,0.05)]"
          )}>
            <UserAvatar speaking={isListening} size={88} imageUrl={imageUrl} userName={userName} />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 text-center leading-tight">{displayName}</span>
              <span className="text-[12px] text-zinc-400 dark:text-zinc-500 capitalize">{config.yourRole.replace(/_/g, " ")}</span>
            </div>
          </div>

          <div className={cn("rounded-2xl p-4 flex flex-col gap-2.5", "bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 shadow-sm")}>
            <AnimatePresence>
              {isCallActive && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-1.5 py-1"
                >
                  <Clock className="size-3 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-[12px] text-zinc-400 dark:text-zinc-500 font-medium tabular-nums"><CallTimer /></span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium",
              "bg-black/4 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/6",
              isListening ? "text-emerald-500 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"
            )}>
              {isListening
                ? <><SoundBars color="#10b981" /><span className="font-semibold">You're speaking</span></>
                : <><MicIcon className="size-3.5" /><span>{isCallActive ? "Mic ready" : "Microphone"}</span></>
              }
            </div>

            <motion.div whileTap={{ scale: 0.97 }} className="w-full">
              <Button
                onClick={handleCall}
                // CHANGE 9: disable while connecting OR ending (redirecting)
                disabled={isTransitioning || isEnding}
                className={cn(
                  "w-full h-11 rounded-xl gap-2 font-semibold text-[13px] border-0 transition-all duration-300 shadow-md",
                  isCallActive
                    ? "bg-red-500 hover:bg-red-400 active:bg-red-600 text-white shadow-red-500/25"
                    : "bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-black/10"
                )}
              >
                <AnimatePresence mode="wait">
                  {isTransitioning ? (
                    <motion.div key="spin" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2Icon className="size-4" />
                    </motion.div>
                  ) : isEnding ? (
                    // CHANGE 10: "Redirecting…" spinner on button while navigating
                    <motion.div key="ending" initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                      <Loader2Icon className="size-4 animate-spin" />Redirecting…
                    </motion.div>
                  ) : isCallActive ? (
                    <motion.div key="end" initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.75, opacity: 0 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
                      <PhoneOffIcon className="size-4" />End Call
                    </motion.div>
                  ) : (
                    <motion.div key="start" initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.75, opacity: 0 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
                      <PhoneIcon className="size-4" />Start Call
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {(isActive || messages.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.22 }}
            className={cn("w-full rounded-2xl overflow-hidden", "bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6 shadow-sm")}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <motion.span
                  className={cn("size-2 rounded-full", isCallActive ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-zinc-300 dark:bg-zinc-600")}
                  animate={isCallActive ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Live Transcript</span>
              </div>
              <span className="text-[11px] text-zinc-300 dark:text-zinc-600 bg-black/4 dark:bg-white/5 px-2.5 py-1 rounded-full ring-1 ring-black/5 dark:ring-white/6">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </span>
            </div>

            <div ref={scrollRef} className="flex flex-col gap-3 p-4 h-56 overflow-y-auto"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.1) transparent" }}
            >
              {messages.length === 0 && !liveAssistantText && !liveUserText && (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="flex gap-1 items-end">
                    {[0, 0.2, 0.4].map((d) => (
                      <motion.div key={d} className="w-1 rounded-full bg-zinc-200 dark:bg-zinc-700"
                        animate={{ height: ["4px", "14px", "4px"] }} transition={{ duration: 1.3, repeat: Infinity, delay: d }} />
                    ))}
                  </div>
                  <p className="text-[12px] text-zinc-400 dark:text-zinc-500">Waiting for conversation…</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}
                >
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                    {msg.role === "user" ? displayName : config.productName}
                  </span>
                  <div className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-zinc-900 text-white dark:bg-zinc-700 dark:text-white rounded-tr-[5px]"
                      : "bg-zinc-100 dark:bg-white/8 text-zinc-700 dark:text-zinc-200 rounded-tl-[5px]"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {liveAssistantText && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1 items-start">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">{config.productName}</span>
                  <div className="max-w-[78%] bg-zinc-100/70 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 rounded-2xl rounded-tl-[5px] px-4 py-2.5 text-[13px] leading-relaxed italic">
                    {liveAssistantText}<TypingCursor />
                  </div>
                </motion.div>
              )}

              {liveUserText && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">{displayName}</span>
                  <div className="max-w-[78%] bg-zinc-800/6 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 rounded-2xl rounded-tr-[5px] px-4 py-2.5 text-[13px] leading-relaxed italic">
                    {liveUserText}<TypingCursor />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}