"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/alert"
import { usersApi, kelasApi } from "@/lib/api"
import { User, School, Trash2, UserPlus, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Save, X, Search } from "lucide-react"

export default function ManageSiswaPage() {
  const [siswaList, setSiswaList] = useState<any[]>([])
  const [kelasList, setKelasList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [error, setError] = useState("")

  // State Filtering
  const [searchTerm, setSearchTerm] = useState('')

  // State Modal Atur Kelas
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null)
  const [selectedKelasId, setSelectedKelasId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // State Modal Sukses (Popup Hijau)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // State Modal Delete (Popup Merah)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteData, setDeleteData] = useState<{kelasId: string, siswaId: string, nama: string} | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dataSiswa, dataKelas] = await Promise.all([
        usersApi.getSiswa(),
        kelasApi.getAll()
      ])
      setSiswaList(dataSiswa)
      setKelasList(dataKelas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data")
    } finally {
      setLoading(false)
    }
  }

  // LOGIC FILTERING (Client-Side)
  const filteredSiswa = siswaList.filter(siswa => {
    const term = searchTerm.toLowerCase();
    return (
      siswa.siswa_nama.toLowerCase().includes(term) ||
      siswa.email.toLowerCase().includes(term)
    );
  });

  // Helper Modal Sukses
  const showSuccessPopup = (msg: string) => {
    setSuccessMessage(msg)
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 2000)
  }

  // Buka Modal Atur Kelas
  const openKelasModal = (siswa: any) => {
    setSelectedSiswa(siswa)
    setSelectedKelasId(siswa.kelas_id || "")
    setError("")
  }

  // Handle Simpan (Assign Kelas)
  const handleAssignKelas = async () => {
    if (!selectedSiswa || !selectedKelasId) {
      setError("Silakan pilih kelas terlebih dahulu")
      return
    }

    setIsProcessing(true)
    try {
      await kelasApi.addSiswa(selectedKelasId, selectedSiswa.siswa_id)
      
      showSuccessPopup(`Berhasil menambahkan ${selectedSiswa.siswa_nama} ke kelas.`)
      
      setSelectedSiswa(null) // Tutup modal
      fetchData() 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengatur kelas")
    } finally {
      setIsProcessing(false)
    }
  }

  // Trigger Delete (Buka Modal Konfirmasi)
  const onDeleteClick = (kelasId: string, siswaId: string, nama: string) => {
    setDeleteData({ kelasId, siswaId, nama })
    setShowDeleteModal(true)
  }

  // Eksekusi Delete
  const confirmDelete = async () => {
    if (!deleteData) return

    setIsProcessing(true)
    try {
      await kelasApi.removeSiswa(deleteData.kelasId, deleteData.siswaId)
      showSuccessPopup(`${deleteData.nama} berhasil dikeluarkan dari kelas`)
      fetchData()
      setShowDeleteModal(false)
      setDeleteData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengeluarkan siswa")
      setShowDeleteModal(false)
    } finally {
      setIsProcessing(false)
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <User className="h-8 w-8 text-blue-600" /> Manage Siswa
                </h1>
                <p className="text-slate-500 mt-1">Daftar semua siswa dan pengaturan pembagian kelas.</p>
              </div>
              <Button onClick={fetchData} variant="outline" size="sm" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm cursor-pointer">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>

            {/* --- SEARCH BAR (NEW) --- */}
            <div className="mb-8 max-w-lg relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder={`Cari siswa dari total ${siswaList.length} siswa berdasarkan nama atau email...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-md"
                />
            </div>
            {/* --- END SEARCH BAR --- */}


            {error && <Alert message={error} type="error" onClose={() => setError("")} />}

            {/* Content Table */}
            {loading ? (
              <div className="flex justify-center h-40 items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Nama Siswa</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Email</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Kelas Saat Ini</th>
                        <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSiswa.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                            <Search className="h-10 w-10 mb-2 opacity-20" />
                            Data siswa tidak ditemukan untuk '{searchTerm}'.
                          </td>
                        </tr>
                      ) : (
                        filteredSiswa.map((siswa) => (
                          <tr key={siswa.siswa_id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-slate-700">{siswa.siswa_nama}</td>
                            <td className="px-6 py-4 text-slate-500">{siswa.email}</td>
                            <td className="px-6 py-4">
                              {siswa.nama_kelas ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                  <School className="w-3 h-3" />
                                  {siswa.nama_kelas}
                                </span>
                              ) : (
                                <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                  Belum ada kelas
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                {/* Tombol Atur Kelas */}
                                <Button
                                  onClick={() => openKelasModal(siswa)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 cursor-pointer"
                                >
                                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                  Atur Kelas
                                </Button>

                                {/* Tombol Hapus (Keluarkan) */}
                                {siswa.kelas_id && (
                                  <Button
                                    onClick={() => onDeleteClick(siswa.kelas_id, siswa.siswa_id, siswa.siswa_nama)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                    title="Keluarkan dari kelas"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </main>
        </div>

        {/* === MODAL ATUR KELAS === */}
        {selectedSiswa && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md bg-white shadow-2xl border-none overflow-hidden scale-100 animate-in zoom-in-95">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Atur Kelas Siswa</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSiswa(null)} disabled={isProcessing} className="text-slate-400 hover:text-red-500 cursor-pointer">
                   <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6">
                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                   <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Siswa Terpilih</p>
                   <p className="text-sm font-medium text-slate-800">{selectedSiswa.siswa_nama}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Kelas Baru</label>
                    <select
                      value={selectedKelasId}
                      onChange={(e) => setSelectedKelasId(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>-- Pilih Kelas --</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_kelas} ({k.tingkat}) {k.jurusan ? `- ${k.jurusan}` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-2">
                      *Siswa akan dipindahkan otomatis jika sudah memiliki kelas sebelumnya.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedSiswa(null)}
                      disabled={isProcessing}
                      className="text-slate-500 cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button 
                      onClick={handleAssignKelas} 
                      disabled={isProcessing || !selectedKelasId}
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] shadow-lg shadow-green-900/20 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                         <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Proses...</>
                      ) : (
                         <><Save className="w-4 h-4 mr-2" /> Simpan</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* === MODAL SUKSES (HIJAU) === */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform scale-100 animate-in zoom-in-95">
               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6 animate-pulse">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Berhasil!</h3>
               <p className="text-slate-500">{successMessage}</p>
            </div>
          </div>
        )}

        {/* === MODAL DELETE (MERAH) === */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !isProcessing && setShowDeleteModal(false)}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 animate-in zoom-in-95 border border-slate-100">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4 animate-pulse">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Keluarkan Siswa?</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Apakah Anda yakin ingin mengeluarkan siswa ini dari kelas? Data nilai di kelas ini mungkin akan terpengaruh.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-500 shadow-md shadow-red-900/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Proses...</>
                  ) : (
                    "Ya, Keluarkan"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}