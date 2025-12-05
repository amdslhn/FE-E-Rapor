"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }

    if (!loading && isAuthenticated && requiredRoles.length > 0) {
      if (!user || !requiredRoles.includes(user.role)) {
        router.push("/unauthorized")
      }
    }
  }, [isAuthenticated, loading, user, requiredRoles, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRoles.length > 0 && (!user || !requiredRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}
