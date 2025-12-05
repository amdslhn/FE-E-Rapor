"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        // Redirect to appropriate dashboard based on role
        const dashboards: Record<string, string> = {
          admin: "/admin/dashboard",
          guru: "/guru/dashboard",
          siswa: "/siswa/dashboard",
        }
        router.push(dashboards[user.role] || "/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  )
}
