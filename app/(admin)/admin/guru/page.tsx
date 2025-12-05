"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/alert"
import { usersApi, kelasApi, mapelApi, guruMapelApi } from "@/lib/api"
import { BookOpen, School, UserCog, Save, Loader2, CheckCircle2, UserPlus } from "lucide-react"

export default function AssignGuruPage() {
  // Data Lists
  const [guruList, setGuruList] = useState<any[]>([])
  const [mapelList, setMapelList] = useState<any[]>([])
  const [kelasList, setKelasList] = useState<any[]>([])

  // Form States
  const [selectedGuru, setSelectedGuru] = useState("")
  const [selectedMapel, setSelectedMapel] = useState("")
  const [selectedKelas, setSelectedKelas] = useState("")

  // UI States
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  
  // Modal Sukses State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [usersData, mapelData, kelasData] = await Promise.all([
        usersApi.getAll(),
        mapelApi.getAll(),
        kelasApi.getAll()
      ])

      const gurus = usersData.filter((u: any) => u.role === "guru")
      
      setGuruList(gurus)
      setMapelList(mapelData)
      setKelasList(kelasData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data master")
    } finally {
      setLoading(false)
    }
  }

  // Helper Modal Sukses
  const showSuccessPopup = (msg: string) => {
    setSuccessMessage(msg)
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 2500)
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (submitting) return

    if (!selectedGuru || !selectedMapel || !selectedKelas) {
      setError("Mohon lengkapi semua pilihan (Guru, Mapel, dan Kelas)")
      return
    }

    setSubmitting(true)
    try {
      await guruMapelApi.assignGuruToMapelKelas(selectedGuru, selectedMapel, selectedKelas)

      const dataGuru = guruList.find(g => String(g.id) === String(selectedGuru))
      const dataMapel = mapelList.find(m => String(m.id) === String(selectedMapel))
      const dataKelas = kelasList.find(k => String(k.id) === String(selectedKelas))

      const namaGuru = dataGuru?.nama || "Guru"
      const namaMapel = dataMapel?.nama_mapel || "Mapel"
      
      let namaKelas = "Kelas"
      if (dataKelas) {
        // Format Nama Kelas untuk pesan sukses
        namaKelas = `${dataKelas.nama_kelas} (${dataKelas.tingkat})`
      }

      showSuccessPopup(`Berhasil: ${namaGuru} ditugaskan mengajar ${namaMapel} di ${namaKelas}`)
      
      // 1. RESET FORM SETELAH SUKSES
      setSelectedGuru("")
      setSelectedMapel("")
      setSelectedKelas("")

    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melakukan assign guru")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Plotting Guru
                </h1>
                <p className="text-slate-500 mt-1">
                  Atur jadwal pengajar: Siapa mengajar apa di kelas mana.
                </p>
              </div>
            </div>

            {error && <Alert message={error} type="error" onClose={() => setError("")} />}

            {/* --- CARD AREA --- */}
            <Card className="mb-8 border-none shadow-xl bg-white overflow-hidden animate-in slide-in-from-top-4 duration-300">
                
                {/* Header Card Abu-abu */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-blue-500"/>
                      Form Penugasan Guru
                   </h2>
                </div>

                <div className="p-6">
                  {loading ? (
                     <div className="flex flex-col justify-center items-center h-40 gap-3">
                       <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                       <p className="text-slate-500 font-medium">Memuat data...</p>
                     </div>
                  ) : (
                    <form onSubmit={handleAssign} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* KOLOM 1: GURU */}
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                             <UserCog className="w-3 h-3 inline mr-1 mb-0.5" /> Pilih Guru
                          </label>
                          <select
                            value={selectedGuru}
                            onChange={(e) => setSelectedGuru(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer transition-all"
                            required
                          >
                            <option value="" disabled>-- Cari Nama Guru --</option>
                            {guruList.map((g) => (
                              <option key={g.id} value={g.id}>{g.nama}</option>
                            ))}
                          </select>
                        </div>

                        {/* KOLOM 2: MAPEL */}
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                             <BookOpen className="w-3 h-3 inline mr-1 mb-0.5" /> Pilih Mapel
                          </label>
                          <select
                            value={selectedMapel}
                            onChange={(e) => setSelectedMapel(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer transition-all"
                            required
                          >
                            <option value="" disabled>-- Cari Mapel --</option>
                            {mapelList.map((m) => (
                              <option key={m.id} value={m.id}>{m.nama_mapel}</option>
                            ))}
                          </select>
                        </div>

                        {/* KOLOM 3: KELAS */}
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                             <School className="w-3 h-3 inline mr-1 mb-0.5" /> Pilih Kelas
                          </label>
                          <select
                            value={selectedKelas}
                            onChange={(e) => setSelectedKelas(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer transition-all"
                            required
                          >
                            <option value="" disabled>-- Cari Kelas --</option>
                            {kelasList.map((k) => (
                              <option key={k.id} value={k.id}>
                                {/* 2. TAMPILKAN TINGKAT DI SINI */}
                                {k.nama_kelas} - (Tingkat {k.tingkat}) {k.jurusan ? `- ${k.jurusan}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>

                      {/* Footer & Tombol Hijau */}
                      <div className="flex justify-end pt-4 border-t border-slate-50">
                        <Button 
                          type="submit" 
                          size="lg"
                          disabled={submitting}
                          className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 px-8 min-w-[160px] h-11"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" /> Simpan Penugasan
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
            </Card>

            {/* Tips Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
               <p className="font-bold flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Info Sistem:
               </p>
               <ul className="list-disc ml-5 space-y-1 opacity-80">
                  <li>Data yang disimpan akan langsung aktif di dashboard guru.</li>
                  <li>Pastikan tidak ada bentrok jadwal di kelas yang sama.</li>
               </ul>
            </div>

          </main>
        </div>

        {/* === MODAL SUKSES (POPUP TENGAH) === */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            
            {/* Card Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform scale-100 animate-in zoom-in-95">
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

      </div>
    </ProtectedRoute>
  )
}