"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/alert"
import { auditApi, usersApi } from "@/lib/api"
import { toWIB } from "@/lib/utils"
// Import Icon (Ditambahkan 'User')
import { 
  FileText, X, RefreshCw, Eye, Activity, Globe, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, User 
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<any>(null)

  // --- STATE BARU UNTUK USER FILTER ---
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")

  // STATE FILTERING & PAGINATION
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) 

  // Load Users saat pertama kali render
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch Logs setiap kali selectedUserId berubah (atau saat pertama render)
  useEffect(() => {
    fetchLogs()
  }, [selectedUserId])

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (err) {
      console.error("Gagal mengambil data user untuk filter", err)
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await auditApi.getLogs(selectedUserId || undefined)
      setLogs(data)
      setCurrentPage(1) 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }
  
  // LOGIC FILTERING
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.user_nama?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.endpoint?.toLowerCase().includes(term) ||
      log.method?.toLowerCase().includes(term) ||
      log.ip_address?.toLowerCase().includes(term) ||
      log.user_email?.toLowerCase().includes(term)
    );
  });

  // LOGIC PAGINATION 
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Helper Warna Method
  const getMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      GET: "bg-blue-100 text-blue-700 border-blue-200",
      POST: "bg-green-100 text-green-700 border-green-200",
      PUT: "bg-amber-100 text-amber-700 border-amber-200",
      DELETE: "bg-red-100 text-red-700 border-red-200",
      PATCH: "bg-purple-100 text-purple-700 border-purple-200",
    }
    return styles[method] || "bg-slate-100 text-slate-700 border-slate-200"
  }

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <Activity className="h-8 w-8 text-blue-600" /> Audit Logs
                </h1>
                <p className="text-slate-500 mt-1">
                  Riwayat aktivitas sistem ({logs.length} Records Loaded).
                </p>
              </div>
              <Button onClick={fetchLogs} variant="outline" size="sm" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm cursor-pointer">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>

            {/* --- FILTER AREA (SEARCH & USER DROPDOWN) --- */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                
                {/* 1. Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari cepat (User, Endpoint, Method, IP)..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-md"
                    />
                </div>

                {/* 2. User Dropdown - PERUBAHAN: Icon Filter diganti jadi User */}
                <div className="relative w-full md:w-64">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-md appearance-none cursor-pointer text-slate-600"
                    >
                        <option value="">Semua User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.nama}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none">
                        <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                    </div>
                </div>

            </div>
            {/* --- END FILTER AREA --- */}

            {error && <Alert message={error} type="error" />}

            {/* Content Table */}
            {loading ? (
              <div className="flex justify-center h-40 items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Waktu</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">User</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Action</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Endpoint</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">IP Addr</th>
                        <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentLogs.length === 0 ? (
                        <tr>
                          {/* PERUBAHAN: Membungkus dalam div untuk memastikan text-center */}
                          <td colSpan={6} className="px-6 py-12">
                            <div className="flex flex-col items-center justify-center w-full text-center text-slate-400">
                                <Search className="h-10 w-10 mb-2 opacity-20" />
                                <p>
                                    {searchTerm ? `Tidak ada log yang cocok dengan pencarian: ${searchTerm}` : `Belum ada riwayat aktivitas.`}
                                </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                            
                            {/* WAKTU */}
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                              {toWIB(log.created_at)}
                            </td>

                            {/* USER - PERUBAHAN: Menambahkan Icon User Avatar */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700">{log.user_nama || "System / Unknown"}</span>
                                    <span className="text-xs text-slate-400">{log.user_email}</span>
                                </div>
                              </div>
                            </td>

                            {/* ACTION & METHOD */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadge(log.method)}`}>
                                  {log.method}
                                </span>
                                <span className="font-medium text-slate-600">{log.action}</span>
                              </div>
                            </td>

                            {/* ENDPOINT */}
                            <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[150px]" title={log.endpoint}>
                              {log.endpoint}
                            </td>

                            {/* IP */}
                            <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                              {log.ip_address}
                            </td>

                            {/* TOMBOL DETAIL */}
                            <td className="px-6 py-4 text-center">
                              <Button
                                onClick={() => setSelected(log)}
                                variant="ghost"
                                size="sm"
                                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-90 group-hover:opacity-100 transition-all cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-1.5" /> Detail
                              </Button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- FOOTER PAGINATION --- */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  {filteredLogs.length > 0 && (
                      <p className="text-xs text-slate-500">
                          Menampilkan <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> - <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredLogs.length)}</span> dari <span className="font-bold text-slate-700">{filteredLogs.length}</span> data
                      </p>
                  )}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {/* First Page */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Prev Page */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="mx-2 text-xs font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-md">
                        Halaman {currentPage} / {totalPages}
                      </div>

                      {/* Next Page */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Last Page */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

              </Card>
            )}

            {/* === MODAL DETAIL (POPUP) === */}
            {selected && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                <Card className="w-full max-w-4xl bg-white shadow-2xl border-none overflow-hidden scale-100 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                  
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600"/> Detail Audit Log
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0 cursor-pointer">
                        <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Grid Info Dasar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">User</p>
                        <p className="font-semibold text-slate-700 truncate" title={selected.user_email}>{selected.user_nama}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status Code</p>
                        <p className={`font-mono font-bold ${selected.status_code >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                           {selected.status_code}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Endpoint</p>
                        <p className="font-mono text-slate-600 truncate" title={selected.endpoint}>{selected.endpoint}</p>
                      </div>
                      
                      {/* USER AGENT */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2 md:col-span-4">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                           <Globe className="w-3 h-3" /> User Agent
                        </p>
                        <p className="font-mono text-xs text-slate-600 break-all leading-relaxed">
                           {selected.user_agent || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Comparison Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      
                      {/* BEFORE */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-400"></div>
                           <span className="font-bold text-slate-700 text-sm">Data Sebelum (Before)</span>
                        </div>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[400px] border border-slate-800 shadow-inner">
                           {selected.before_data ? (
                             <pre>{JSON.stringify(selected.before_data, null, 2)}</pre>
                           ) : (
                             <span className="text-slate-600 italic">Tidak ada data sebelumnya (Create Action)</span>
                           )}
                        </div>
                      </div>

                      {/* AFTER */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-400"></div>
                           <span className="font-bold text-slate-700 text-sm">Data Sesudah (After)</span>
                        </div>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[400px] border border-slate-800 shadow-inner">
                           {selected.after_data ? (
                             <pre>{JSON.stringify(selected.after_data, null, 2)}</pre>
                           ) : (
                             <span className="text-slate-600 italic">Tidak ada data baru (Delete Action)</span>
                           )}
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <Button onClick={() => setSelected(null)} variant="outline" className="bg-white hover:bg-slate-100">
                      Tutup
                    </Button>
                  </div>

                </Card>
              </div>
            )}

          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}