"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"

const TIMEOUT_MS = 10 * 60 * 1000 

export function AutoLockTimer() {
  const router = useRouter()
  const pathname = usePathname()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    // Hapus timer sebelumnya jika ada
    if (timerRef.current) clearTimeout(timerRef.current)
    
    // Jangan jalankan timer jika sedang di halaman Login atau Locked
    if (pathname === "/login" || pathname === "/locked") return

    // Mulai hitung mundur baru
    timerRef.current = setTimeout(() => {
      // Jika waktu habis, paksa pindah ke halaman locked
      console.log("User idle too long, locking system...")
      router.push("/locked")
    }, TIMEOUT_MS)
  }

  useEffect(() => {
    // Daftar event aktivitas user
    const events = [
        "mousedown", 
        "mousemove", 
        "keydown", 
        "scroll", 
        "touchstart", 
        "click"
    ]
    
    // Handler saat ada aktivitas
    const handleActivity = () => resetTimer()

    // Pasang event listener
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Jalankan timer pertama kali
    resetTimer()

    // Bersihkan listener saat komponen di-unmount (pindah halaman/refresh)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [pathname, router]) // Reset logic setiap pindah halaman

  return null // Komponen invisible
}