"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/alert"
import { useAuth } from "@/lib/auth-context"
import { nilaiApi } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// Import Icon Lengkap
import { 
  GraduationCap, BarChart3, CheckCircle2, XCircle, 
  Calendar, ArrowRight, LayoutDashboard, BookOpen 
} from "lucide-react"

interface NilaiItem {
  id: number
  nilai_angka: string 
  kkm: number
  semester: number
}

export default function SiswaDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ rataRata: "0", tuntas: 0, tidakTuntas: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user?.id) return

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await nilaiApi.getNilaiBySiswa(user.id)
        const data: NilaiItem[] = Array.isArray(response) ? response : (response as any).data || []

        if (data.length === 0) {
           setStats({ rataRata: "0", tuntas: 0, tidakTuntas: 0 })
        } else {
           let totalNilai = 0
           let jumlahTuntas = 0
           let jumlahTidakTuntas = 0

           data.forEach((item) => {
             const nilai = parseFloat(item.nilai_angka)
             const kkm = item.kkm

             totalNilai += nilai
             if (nilai >= kkm) {
               jumlahTuntas++
             } else {
               jumlahTidakTuntas++
             }
           })

           const avg = (totalNilai / data.length).toFixed(2)
           setStats({ 
             rataRata: avg, 
             tuntas: jumlahTuntas, 
             tidakTuntas: jumlahTidakTuntas 
           })
        }

      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Gagal memuat data dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  return (
    <ProtectedRoute requiredRoles={["siswa"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            {/* Header Dashboard */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <LayoutDashboard className="h-8 w-8 text-blue-600" /> Dashboard Siswa
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Selamat datang, <span className="font-semibold text-slate-700">{user?.name}</span>! Semangat belajar dan tingkatkan prestasimu.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {error && <Alert message={error} type="error" />}

            {loading ? (
              <div className="flex justify-center h-64 items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* --- STATISTIK CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: Rata-Rata Nilai */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Rata-Rata Nilai</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.rataRata}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
                           <BarChart3 className="w-3 h-3" />
                           <span>Akumulasi</span>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Mapel Tuntas */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Mapel Tuntas</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.tuntas}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                           <CheckCircle2 className="w-3 h-3" />
                           <span>Lulus KKM</span>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>

                  {/* Card 3: Mapel Belum Tuntas */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Belum Tuntas</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.tidakTuntas}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full">
                           <XCircle className="w-3 h-3" />
                           <span>Belum Tuntas</span>
                        </div>
                      </div>
                      <div className="p-4 bg-red-100 rounded-2xl text-red-600 shadow-sm">
                        <XCircle className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>

                </div>


              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}