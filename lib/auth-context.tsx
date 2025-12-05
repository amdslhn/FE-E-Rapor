"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authApi } from "./api"
import { jwtDecode } from "jwt-decode"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "guru" | "siswa"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null
  return null
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  const checkAuth = () => {
    const token = getCookie("token") // kamu buat fungsinya sendiri

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const decoded: any = jwtDecode(token)

      if (decoded.exp * 1000 < Date.now()) {
        setUser(null)
      } else {
        setUser({
          id: decoded.id,
          role: decoded.role,
          email: decoded.email,
          name: decoded.name,
        })
      }
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  checkAuth()
}, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: loginUser } = await authApi.login(email, password)
      setUser(loginUser)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logout()
      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
