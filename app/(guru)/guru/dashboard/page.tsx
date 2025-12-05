"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/alert"
import { useAuth } from "@/lib/auth-context"
// Import Icon Lengkap (Tambah School)
import { 
  BookOpen, Users, LayoutDashboard, GraduationCap, 
  Calendar, Activity, ArrowRight, School 
} from "lucide-react"
import { guruMapelApi } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GuruMapelKelas {
  id: number
  guru_id: number
  mapel_id: string
  kelas_id: string
  nama_mapel: string
  nama_kelas: string
  tingkat?: string
  jurusan?: string
}

export default function GuruDashboard() {
  const { user } = useAuth()
  
  const [teachingList, setTeachingList] = useState<GuruMapelKelas[]>([])
  const [stats, setStats] = useState({ kelasCount: 0, mapelCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const rawData = await guruMapelApi.getMapelKelasByGuru(String(user.id))
        const data = rawData as GuruMapelKelas[]

        setTeachingList(data)

        const uniqueKelas = new Set(data.map((item) => item.kelas_id)).size
        const uniqueMapel = new Set(data.map((item) => item.mapel_id)).size

        setStats({
            kelasCount: uniqueKelas,
            mapelCount: uniqueMapel
        })

      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Gagal mengambil data jadwal mengajar.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
        fetchData()
    }
  }, [user])

  return (
    <ProtectedRoute requiredRoles={["guru"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            {/* Header Dashboard */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <LayoutDashboard className="h-8 w-8 text-blue-600" /> Dashboard Guru
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Selamat datang, <span className="font-semibold text-slate-700">{user?.name}</span>! Berikut ringkasan jadwal mengajar Anda.
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
                  
                  {/* Card 1: Total Kelas */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kelas</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.kelasCount}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
                           <School className="w-3 h-3" />
                           <span>Kelas Diajar</span>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                        <School className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Total Mapel */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Mata Pelajaran</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.mapelCount}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                           <BookOpen className="w-3 h-3" />
                           <span>Diampu</span>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>

                  {/* Card 3: Shortcut Input Nilai */}
                  <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                     <div>
                        <h3 className="text-lg font-bold mb-1">Input Nilai Siswa</h3>
                        <p className="text-sm text-slate-300 opacity-90">Kelola nilai harian, UTS, dan UAS.</p>
                     </div>
                     <div className="mt-4 flex justify-end">
                        <Link href="/guru/input-nilai">
                           <Button size="sm" className="bg-white text-slate-900 hover:bg-blue-50 font-bold shadow-md cursor-pointer">
                              Mulai Input <ArrowRight className="ml-2 w-4 h-4" />
                           </Button>
                        </Link>
                     </div>
                  </Card>
                </div>

                {/* --- DAFTAR KELAS (GRID) --- */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                         <BookOpen className="w-5 h-5 text-blue-600" /> Jadwal Mengajar
                      </h3>
                   </div>

                   {teachingList.length === 0 ? (
                      <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
                         <BookOpen className="h-12 w-12 text-slate-300 mb-3" />
                         <p className="text-slate-500 font-medium">Belum ada jadwal mata pelajaran yang diampu.</p>
                         <p className="text-xs text-slate-400 mt-1">Hubungi admin jika data belum sesuai.</p>
                      </Card>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {teachingList.map((item) => (
                            <Card 
                               key={item.id} 
                               className="group relative overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
                            >
                               {/* Header Gradient */}
                               <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>

                               <div className="p-5">
                                  {/* PENTING: Menggunakan justify-center untuk menengahkan ikon School */}
                                  <div className="flex justify-center mb-4"> 
                                     {/* ICON KELAS (School) */}
                                     <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                                        <School className="h-6 w-6 text-blue-600" />
                                     </div>
                                  </div>

                                  {/* PENTING: Menggunakan text-center untuk menengahkan teks kelas dan mapel */}
                                  <div className="mb-2 text-center">
                                     <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1">
                                        {item.nama_kelas}
                                     </h3>
                                     
                                     {/* ICON MAPEL (BookOpen) dan teks mapel. Ditambahkan justify-center karena flex */}
                                     <p className="text-sm text-slate-500 font-medium flex items-center gap-2 justify-center">
                                        <BookOpen className="w-4 h-4 text-emerald-600" />
                                        {item.nama_mapel}
                                     </p>
                                  </div>
                               </div>
                            </Card>
                         ))}
                      </div>
                   )}
                </div>

              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}