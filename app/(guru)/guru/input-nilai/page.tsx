"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation" // Import SearchParams
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/alert"
import { nilaiApi, usersApi, apiCall } from "@/lib/api"
// Import Icon
import { 
  FileText, Save, CheckCircle2, Loader2, 
  School, BookOpen, User, Hash 
} from "lucide-react"

export default function InputNilai() {
  const searchParams = useSearchParams() // Baca URL Params
  
  // State Data Master
  const [rawSchedule, setRawSchedule] = useState<any[]>([]) 
  const [listSiswa, setListSiswa] = useState<any[]>([])

  // State UI
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  // Modal Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // State Form
  const [selectedKelas, setSelectedKelas] = useState("")
  const [selectedMapel, setSelectedMapel] = useState("")
  const [selectedSiswa, setSelectedSiswa] = useState("")
  const [semester, setSemester] = useState("1")
  const [nilai, setNilai] = useState<string>("")

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Ambil Token & Decode ID Guru
        const getTokenFromCookie = (name: string) => {
          if (typeof document === "undefined") return null;
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        }

        const token = getTokenFromCookie('token');
        if (!token) throw new Error("Sesi kadaluarsa. Silakan login ulang.");

        let guruId = null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            guruId = decoded.id;
        } catch (e) {
            throw new Error("Gagal memproses data user.");
        }

        if (!guruId) throw new Error("ID Guru tidak ditemukan.");

        // Fetch Data API
        const [scheduleData, siswaData] = await Promise.all([
            apiCall(`/guru/${guruId}/mapel-kelas`),
            usersApi.getSiswa()
        ])

        setRawSchedule(Array.isArray(scheduleData) ? scheduleData : [])
        setListSiswa(Array.isArray(siswaData) ? siswaData : [])
        
        // AUTO FILL DARI URL (Jika ada)
        const urlKelasId = searchParams.get("kelasId")
        const urlMapelId = searchParams.get("mapelId")
        
        if (urlKelasId) setSelectedKelas(urlKelasId)
        if (urlMapelId) setSelectedMapel(urlMapelId)

      } catch (err) {
        console.error("Fetch Error:", err)
        setError(err instanceof Error ? err.message : "Gagal mengambil data master")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams]) // Re-run jika URL params berubah

  // --- 2. LOGIKA FILTERING ---

  const listKelasUnik = useMemo(() => {
    const uniqueKelas = new Map()
    rawSchedule.forEach(item => {
      if (!uniqueKelas.has(item.kelas_id)) {
        uniqueKelas.set(item.kelas_id, {
            id: item.kelas_id,
            nama: item.nama_kelas
        })
      }
    })
    return Array.from(uniqueKelas.values())
  }, [rawSchedule])

  const listMapelFiltered = useMemo(() => {
    if (!selectedKelas) return []
    return rawSchedule
      .filter(item => item.kelas_id === selectedKelas)
      .map(item => ({
        id: item.mapel_id,
        nama: item.nama_mapel
      }))
  }, [rawSchedule, selectedKelas])

  const filteredSiswa = listSiswa.filter(
    (siswa) => !selectedKelas || String(siswa.kelas_id) === String(selectedKelas)
  )

  // --- 3. HELPER & SUBMIT ---
  
  const showSuccessPopup = (msg: string) => {
    setSuccessMessage(msg)
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (isSubmitting) return

    if (!selectedKelas || !selectedMapel || !selectedSiswa) {
      setError("Mohon lengkapi semua pilihan (Kelas, Mapel, Siswa)")
      return
    }

    if (nilai === "") {
      setError("Nilai wajib diisi")
      return
    }

    setIsSubmitting(true)
    try {
      await nilaiApi.createNilai(
        selectedSiswa, 
        selectedMapel, 
        semester, 
        { nilai: Number(nilai) }
      )

      showSuccessPopup("Nilai berhasil disimpan!")
      setNilai("") // Reset nilai
      // setSelectedSiswa("") // Opsional: Reset siswa jika mau input beruntun satu kelas
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan nilai")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRoles={["guru"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <FileText className="h-8 w-8 text-blue-600" /> Input Nilai
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Formulir penilaian hasil belajar siswa.
                </p>
              </div>
            </div>

            {error && <Alert message={error} type="error" onClose={() => setError("")} />}

            {loading ? (
              <div className="flex justify-center h-64 items-center flex-col gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Memuat data kelas...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto mt-4">
                 <Card className="mb-8 border-none shadow-xl bg-white overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Card Header */}
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-2">
                       <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                          <FileText className="w-4 h-4" />
                       </div>
                       <h2 className="text-lg font-bold text-slate-800">Form Penilaian</h2>
                    </div>
                    
                    <div className="p-6 md:p-8">
                       <form onSubmit={handleSubmit} className="space-y-8">
                          
                          {/* SECTION 1: DATA KELAS & MAPEL */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                                   <School className="w-3 h-3" /> Kelas
                                </label>
                                <select
                                  value={selectedKelas}
                                  onChange={(e) => {
                                    setSelectedKelas(e.target.value)
                                    setSelectedMapel("") 
                                    setSelectedSiswa("") 
                                  }}
                                  required
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none cursor-pointer"
                                >
                                  <option value="">-- Pilih Kelas --</option>
                                  {listKelasUnik.map((k) => (
                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                  ))}
                                </select>
                             </div>

                             <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                                   <BookOpen className="w-3 h-3" /> Mata Pelajaran
                                </label>
                                <select
                                  value={selectedMapel}
                                  onChange={(e) => setSelectedMapel(e.target.value)}
                                  required
                                  disabled={!selectedKelas}
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none cursor-pointer disabled:opacity-60"
                                >
                                  <option value="">
                                    {selectedKelas ? "-- Pilih Mapel --" : "Pilih Kelas Dahulu"}
                                  </option>
                                  {listMapelFiltered.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nama}</option>
                                  ))}
                                </select>
                             </div>
                          </div>
                          
                          <div className="h-px bg-slate-100 w-full"></div>

                          {/* SECTION 2: DATA SISWA & NILAI */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             
                             <div className="md:col-span-3 space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                                   <User className="w-3 h-3" /> Nama Siswa
                                </label>
                                <select
                                  value={selectedSiswa}
                                  onChange={(e) => setSelectedSiswa(e.target.value)}
                                  required
                                  disabled={!selectedKelas}
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none cursor-pointer disabled:opacity-60"
                                >
                                  <option value="">
                                    {selectedKelas ? "-- Pilih Siswa --" : "Pilih Kelas Dahulu"}
                                  </option>
                                  {filteredSiswa.length === 0 && selectedKelas ? (
                                    <option disabled>Tidak ada siswa di kelas ini</option>
                                  ) : (
                                    filteredSiswa.map((s) => (
                                      <option key={s.siswa_id} value={s.siswa_id}>{s.siswa_nama}</option>
                                    ))
                                  )}
                                </select>
                             </div>

                             <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                                   <Hash className="w-3 h-3" /> Nilai (0-100)
                                </label>
                                <input
                                  type="number"
                                  value={nilai}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    if (val === "" || (Number(val) >= 0 && Number(val) <= 100)) {
                                        setNilai(val)
                                    }
                                  }}
                                  placeholder="0"
                                  required
                                  min="0"
                                  max="100"
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm placeholder:font-normal"
                                />
                             </div>

                             <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Semester</label>
                                <div className="grid grid-cols-2 gap-4">
                                   <div 
                                      onClick={() => setSemester("1")}
                                      className={`cursor-pointer px-4 py-3 rounded-xl border text-center text-sm font-medium transition-all ${semester === "1" ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                   >
                                      Semester 1 (Ganjil)
                                   </div>
                                   <div 
                                      onClick={() => setSemester("2")}
                                      className={`cursor-pointer px-4 py-3 rounded-xl border text-center text-sm font-medium transition-all ${semester === "2" ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                   >
                                      Semester 2 (Genap)
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* SUBMIT BUTTON */}
                          <div className="pt-6">
                             <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                             >
                                {isSubmitting ? (
                                   <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
                                ) : (
                                   <><Save className="mr-2 h-5 w-5" /> Simpan Nilai</>
                                )}
                             </Button>
                          </div>

                       </form>
                    </div>
                 </Card>

                 {/* Tips Section */}
                 <div className="text-center text-xs text-slate-400">
                    <p>Pastikan data yang dipilih sudah benar sebelum menyimpan.</p>
                 </div>
              </div>
            )}

            {/* === MODAL SUKSES === */}
            {showSuccessModal && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform scale-100 animate-in zoom-in-95">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6 animate-pulse">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Berhasil!</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}