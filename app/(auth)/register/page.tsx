"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Alert } from "@/components/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Import Eye dan EyeOff
import { Loader2, Lock, Mail, GraduationCap, ArrowRight, CheckCircle2, User, Eye, EyeOff, School, UserPlus } from "lucide-react"
import { authApi } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false) 
  
  // State baru untuk toggle password
  const [showPassword, setShowPassword] = useState(false) 

  const [formData, setFormData] = useState({
    nisn: "",
    nama: "",
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      await authApi.registerSiswa(formData)
      
      // Trigger Popup Sukses
      setSuccess(true)
      
      // Redirect setelah 2 detik
      setTimeout(() => {
        router.push("/login")
      }, 2000)

    } catch (err: any) {
      console.error("Register Error:", err)
      setError(err.message || "Gagal mendaftar. Cek kembali data Anda.")
      setIsLoading(false)
    } 
  }

  return (
    <>
      <style jsx global>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        
        /* Animasi Standar */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-popup { animation: popupIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>

      <div className="w-full min-h-screen flex bg-slate-50 overflow-hidden font-sans relative">
        
        {/* --- KOLOM KIRI: FORM REGISTER --- */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-md space-y-8 animate-fade-up">
            
            {/* Header Form */}
            <div className="text-center">
              <div className="lg:hidden mx-auto h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg animate-float">
                 <UserPlus className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Buat Akun Baru
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Lengkapi data diri siswa untuk memulai
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/60 rounded-2xl sm:px-10 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1 delay-100 animate-fade-up">
              
              {/* Alert Error (Tetap di sini kalau error) */}
              {error && (
                 <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3 animate-fade-up">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <p>{error}</p>
                 </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                
                {/* Input NISN */}
                <div className="group">
                  <Label htmlFor="nisn" className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                    NISN
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                    </div>
                    <Input 
                      id="nisn" name="nisn" type="number" required placeholder="Nomor Induk Siswa"
                      value={formData.nisn} onChange={handleChange}
                      className="pl-10 block w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 rounded-lg transition-all"
                    />
                  </div>
                </div>

                {/* Input Nama */}
                <div className="group">
                  <Label htmlFor="nama" className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                    Nama Lengkap
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                    </div>
                    <Input 
                      id="nama" name="nama" type="text" required placeholder="Nama sesuai ijazah"
                      value={formData.nama} onChange={handleChange}
                      className="pl-10 block w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 rounded-lg transition-all"
                    />
                  </div>
                </div>

                {/* Input Email */}
                <div className="group">
                  <Label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                    Email
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                    </div>
                    <Input 
                      id="email" name="email" type="email" required placeholder="email@sekolah.sch.id"
                      value={formData.email} onChange={handleChange}
                      className="pl-10 block w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 rounded-lg transition-all"
                    />
                  </div>
                </div>

                {/* Input Password (dengan Toggle Mata) */}
                <div className="group">
                  <Label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                    Password
                  </Label>
                  <div className="relative">
                    {/* Lock Icon (Left) */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                    </div>
                    
                    {/* Toggle Button (Right) - NEW */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
                        aria-label="Toggle Password Visibility"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>

                    <Input 
                      id="password" 
                      name="password" 
                      // Tipe input dinamis
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="Buat password aman"
                      value={formData.password} onChange={handleChange}
                      // Tambah padding kanan untuk Icon Eye
                      className="pl-10 pr-10 block w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 rounded-lg transition-all"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" disabled={isLoading || success}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                        </>
                    ) : (
                        "Daftar Sekarang"
                    )}
                </Button>
              </form>

              {/* Link ke Login */}
              <div className="mt-6 text-center text-sm text-slate-500">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors inline-flex items-center">
                  Login disini <ArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: BRANDING --- */}
        <div className="hidden lg:flex w-[55%] flex-col justify-between bg-slate-900 text-white p-16 relative rounded-l-[200px] shadow-2xl z-10 transition-all duration-500">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-50 rounded-l-[200px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 rounded-l-[200px]"></div>
          
          <div className="relative z-10 flex items-center gap-3 font-bold text-xl tracking-tight animate-fade-up delay-100">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
              <GraduationCap className="w-6 h-6 text-blue-400" />
            </div>
            <span>E-Rapor System</span>
          </div>

          <div className="relative z-10 max-w-lg mb-24 animate-fade-up delay-200">
            <h2 className="text-5xl font-extrabold tracking-tight leading-[1.15] mb-6">
              Mulai Perjalanan <br/>
              Akademikmu <br/>
              <span className="text-blue-400 inline-block animate-float">Disini.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Bergabunglah dengan ribuan siswa lainnya dalam ekosistem pendidikan digital yang modern, transparan, dan terintegrasi.
            </p>
          </div>

          <div className="relative z-10 text-sm text-slate-500 font-medium animate-fade-up delay-300">
            &copy; 2025 Sekolah Digital Indonesia.
          </div>
        </div>

        {/* ============================================== */}
        {/* MODAL POPUP SUKSES BESAR (OVERLAY) */}
        {/* ============================================== */}
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-popup p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-slate-100">
              
              {/* Icon Besar */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6 animate-pulse">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              
              {/* Teks Judul */}
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                Registrasi Berhasil!
              </h3>
              
              {/* Teks Deskripsi */}
              <p className="text-slate-500 mb-6 leading-relaxed">
                Akun siswa berhasil dibuat. <br/>
                Sistem akan mengarahkan Anda ke halaman login secara otomatis.
              </p>

              {/* Loading Indicator Bawah */}
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-400 bg-slate-50 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                Mengalihkan...
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  )
}