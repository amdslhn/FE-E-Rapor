"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/alert"
import { Button } from "@/components/ui/button" // IMPORT BUTTON DITAMBAHKAN
import { usersApi, kelasApi, mapelApi, auditApi } from "@/lib/api"
import { toWIB } from "@/lib/utils"
// Import Icon
import { Users, School, BookOpen, Activity, TrendingUp, Calendar, LayoutDashboard, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, kelas: 0, mapel: 0 })
  const [recentLogs, setRecentLogs] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersData, kelasData, mapelData, logsData] = await Promise.all([
          usersApi.getAll(),
          kelasApi.getAll(),
          mapelApi.getAll(),
          auditApi.getLogs()
        ])

        setStats({
          users: usersData.length,
          kelas: kelasData.length,
          mapel: mapelData.length,
        })

        setRecentLogs(logsData.slice(0, 5))

      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatAction = (method: string, action: string) => {
    if (method === "POST") return <span className="text-green-600 font-bold">Menambahkan</span>
    if (method === "PUT") return <span className="text-amber-600 font-bold">Mengupdate</span>
    if (method === "DELETE") return <span className="text-red-600 font-bold">Menghapus</span>
    return <span className="text-blue-600 font-bold">Akses</span>
  }

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <LayoutDashboard className="h-8 w-8 text-blue-600" /> Admin Dashboard
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Ringkasan data sistem akademik E-Rapor secara realtime.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {error && <Alert message={error} type="error" />}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CARD 1: TOTAL USERS */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Users</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.users}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
                           <TrendingUp className="w-3 h-3" />
                           <span>Aktif</span>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                        <Users className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>

                  {/* CARD 2: TOTAL KELAS */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kelas</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.kelas}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                           <Activity className="w-3 h-3" />
                           <span>Terdaftar</span>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
                        <School className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>

                  {/* CARD 3: TOTAL MAPEL */}
                  <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Mapel</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">{stats.mapel}</h2>
                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-violet-600 bg-violet-50 w-fit px-2 py-1 rounded-full">
                           <BookOpen className="w-3 h-3" />
                           <span>Kurikulum</span>
                        </div>
                      </div>
                      <div className="p-4 bg-violet-100 rounded-2xl text-violet-600 shadow-sm">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   
                   {/* KOLOM KIRI: AKTIVITAS TERBARU */}
                   <Card className="p-0 border-slate-200 shadow-sm bg-white lg:col-span-2 overflow-hidden flex flex-col">
                      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-500" /> Aktivitas Terbaru
                        </h3>
                        <Link href="/admin/audit-logs" className="text-xs font-medium text-blue-600 hover:underline flex items-center">
                          Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                      
                      <div className="p-0">
                        {recentLogs.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                             <Activity className="w-8 h-8 mb-2 opacity-20" />
                             <p className="text-sm">Belum ada aktivitas tercatat.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-50">
                            {recentLogs.map((log, i) => (
                              <div key={i} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                                <div className="mt-1 min-w-[8px] h-2 rounded-full bg-blue-500"></div>
                                <div className="flex-1">
                                  <p className="text-sm text-slate-700">
                                    <span className="font-bold text-slate-900">{log.user_nama}</span> telah {formatAction(log.method, log.action)} pada menu <span className="font-mono text-xs bg-slate-100 px-1 rounded text-slate-500">{log.endpoint}</span>
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {toWIB(log.created_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                   </Card>
                   
                   {/* KOLOM KANAN: WELCOME CARD */}
                   <Card className="p-6 border-slate-200 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xl mb-3">Halo, Admin! 👋</h3>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed opacity-90">
                          Anda memiliki akses penuh untuk mengelola User, Kelas, Mata Pelajaran, dan memantau Audit Logs sistem.
                        </p>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                          <span>Kapasitas Server</span>
                          <span>Stabil</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
                           <div className="bg-emerald-500 w-[95%] h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                        {/* FIX: GUNAKAN BUTTON DARI COMPONENT IMPORT */}
                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs h-9">
                           Lihat Dokumentasi
                        </Button>
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