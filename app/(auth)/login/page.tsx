"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
// Hapus import Alert biasa, kita buat custom error display
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Mail, GraduationCap, Eye, EyeOff, ShieldAlert, XCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  
  const [showPassword, setShowPassword] = useState<boolean>(false)
  
  // --- LOGIC LOCKOUT BERTINGKAT ---
  const MAX_ATTEMPTS = 3
  const BASE_LOCKOUT_TIME = 30 // Waktu dasar 30 detik
  
  const [failedAttempts, setFailedAttempts] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [lockoutTimer, setLockoutTimer] = useState<number>(0)
  const [lockoutLevel, setLockoutLevel] = useState<number>(1) // Level hukuman (1x, 2x, 3x)

  const { login } = useAuth()
  const router = useRouter()

  // 1. Cek Local Storage saat Load
  useEffect(() => {
    const storedAttempts = localStorage.getItem("loginAttempts")
    const storedLockoutTime = localStorage.getItem("lockoutTime")
    const storedLevel = localStorage.getItem("lockoutLevel") // Ambil level hukuman

    if (storedAttempts) setFailedAttempts(parseInt(storedAttempts))
    if (storedLevel) setLockoutLevel(parseInt(storedLevel))

    if (storedLockoutTime) {
      const unlockTime = parseInt(storedLockoutTime)
      const currentTime = new Date().getTime()

      if (currentTime < unlockTime) {
        setIsLocked(true)
        const remainingTime = Math.ceil((unlockTime - currentTime) / 1000)
        setLockoutTimer(remainingTime)
      } else {
        // Jika waktu sudah habis saat di-refresh, buka kunci tapi jangan reset level
        unlockAccount()
      }
    }
  }, [])

  // 2. Timer Hitung Mundur
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLocked && lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer((prev) => prev - 1)
      }, 1000)
    } else if (lockoutTimer === 0 && isLocked) {
      unlockAccount()
    }
    return () => clearInterval(timer)
  }, [isLocked, lockoutTimer])

  // Fungsi: Buka Kunci (User boleh coba lagi, tapi level hukuman tetap tersimpan)
  const unlockAccount = () => {
    setIsLocked(false)
    setFailedAttempts(0)
    setLockoutTimer(0)
    setError("")
    localStorage.removeItem("loginAttempts")
    localStorage.removeItem("lockoutTime")
    // Note: lockoutLevel TIDAK dihapus disini, agar hukuman berikutnya bertambah
  }

  // Fungsi: Reset Total (Hanya dipanggil kalau LOGIN SUKSES)
  const resetAllSecurity = () => {
    unlockAccount()
    setLockoutLevel(1) // Reset level ke 1
    localStorage.removeItem("lockoutLevel")
  }

  // Fungsi: Kunci Akun (Progressive)
  const lockAccount = () => {
    setIsLocked(true)
    
    // Hitung durasi: 30 detik * Level (30s, 60s, 90s, dst)
    const duration = BASE_LOCKOUT_TIME * lockoutLevel 
    setLockoutTimer(duration)

    const unlockTime = new Date().getTime() + duration * 1000
    localStorage.setItem("lockoutTime", unlockTime.toString())
    
    // NAIKKAN LEVEL UNTUK BERIKUTNYA
    const nextLevel = lockoutLevel + 1
    setLockoutLevel(nextLevel)
    localStorage.setItem("lockoutLevel", nextLevel.toString())

    setError("") // Hapus error teks biasa karena overlay akan muncul
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return

    setError("")
    setLoading(true)

    try {
      await login(email, password)
      
      // JIKA SUKSES -> HAPUS SEMUA DOSA
      resetAllSecurity()
      router.push("/")
      
    } catch (err) {
      // --- LOGIC JIKA GAGAL ---
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      localStorage.setItem("loginAttempts", newAttempts.toString())

      if (newAttempts >= MAX_ATTEMPTS) {
        lockAccount()
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts
        // Custom error message
        if (err instanceof Error) {
            // Kita abaikan pesan error bawaan server kalau mau rapi, atau pakai custom:
            setError(`Password/Email salah! (Sisa percobaan: ${remaining})`)
        } else {
            setError(`Password/Email salah! (Sisa percobaan: ${remaining})`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-red { 0%, 100% { background-color: rgba(239, 68, 68, 0.1); } 50% { background-color: rgba(239, 68, 68, 0.3); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
        
        .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-red { animation: pulse-red 2s infinite; }
        .animate-shake { animation: shake 0.4s ease-in-out; } /* Shake cuma sekali saat muncul */
      `}</style>

      {/* --- OVERLAY FULL SCREEN (Saat Terkunci) --- */}
      {isLocked && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md px-4 text-center transition-all duration-300">
          <div className="bg-white/10 border border-white/20 p-8 rounded-3xl max-w-md w-full shadow-2xl backdrop-blur-xl animate-fade-up">
            
            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse-red">
              <ShieldAlert className="w-12 h-12 text-red-500 animate-shake" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Akses Sementara Dibekukan
            </h2>
            
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Terdeteksi aktivitas mencurigakan. Demi keamanan data nilai siswa, akun ini dikunci sementara.
            </p>

            {/* Indikator Level Hukuman */}
            {lockoutLevel > 2 && (
                <div className="mb-4 inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-xs font-medium">
                    Pelanggaran Berulang (Level {lockoutLevel - 1})
                </div>
            )}

            <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/10 mb-6">
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Coba lagi dalam</span>
              <div className="text-5xl font-mono font-bold text-red-400 mt-2">
                {Math.floor(lockoutTimer / 60) > 0 
                  ? `${Math.floor(lockoutTimer / 60)}:${(lockoutTimer % 60).toString().padStart(2, '0')}`
                  : `00:${lockoutTimer.toString().padStart(2, '0')}`
                }
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                 {lockoutTimer > 60 ? "Waktu ditambah karena kesalahan berulang" : "Detik"}
              </span>
            </div>
          </div>
        </div>
      )}


      <div className="w-full min-h-screen flex bg-slate-50 overflow-hidden font-sans">
        
        {/* --- KOLOM KIRI (BRANDING) --- */}
        <div className="hidden lg:flex w-[55%] flex-col justify-between bg-slate-900 text-white p-16 relative rounded-r-[200px] shadow-2xl z-10 transition-all duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-50 rounded-r-[200px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 rounded-r-[200px]"></div>
          
          <div className="relative z-10 flex items-center gap-3 font-bold text-xl tracking-tight animate-fade-up">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner group cursor-pointer hover:bg-white/20 transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span>E-Rapor System</span>
          </div>

          <div className="relative z-10 max-w-lg mt-10 animate-fade-up delay-100">
            <h2 className="text-5xl font-extrabold tracking-tight leading-[1.15] mb-6">
              Kelola Nilai & <br/>
              Data Akademik <br/>
              <span className="text-blue-400 inline-block animate-float" style={{ animationDelay: '1s' }}>Lebih Mudah.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Platform terintegrasi untuk Guru, Siswa, dan Administrator sekolah dalam memantau perkembangan pendidikan secara realtime.
            </p>
          </div>
          <div className="relative z-10 text-sm text-slate-500 font-medium animate-fade-up delay-200">
            &copy; 2025 Sekolah Digital Indonesia.
          </div>
        </div>

        {/* --- KOLOM KANAN (FORM) --- */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-12">
          <div className="w-full max-w-md space-y-8 animate-fade-up delay-300">
            
            <div className="text-center">
              <div className="lg:hidden mx-auto h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg animate-float">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Selamat Datang
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/60 rounded-2xl sm:px-10 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1">
              
              {/* --- CUSTOM ERROR NOTIFICATION (PENGGANTI TOAST) --- */}
              {error && !isLocked && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-shake shadow-sm">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">Gagal Masuk</p>
                    <p className="text-sm text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}
              {/* --------------------------------------------------- */}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="group">
                  <Label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      required
                      disabled={isLocked || loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 rounded-lg bg-slate-50 focus:bg-white transition-all duration-200"
                      placeholder="emailanda@gmail.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <Label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLocked}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      required
                      disabled={isLocked || loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 rounded-lg bg-slate-50 focus:bg-white transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || isLocked}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-slate-900/20 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 h-11 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Memproses...</>
                  ) : (
                    "Masuk Dashboard"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500 font-medium">Belum memiliki akun?</span></div>
                  </div>
                  <Link href="/register" className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors">
                    Daftarkan Siswa Baru &rarr;
                  </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}