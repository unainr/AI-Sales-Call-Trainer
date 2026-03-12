"use client"
// components/AutoRefresh.tsx
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AutoRefresh() {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(id)
  }, [router])
  return null
}