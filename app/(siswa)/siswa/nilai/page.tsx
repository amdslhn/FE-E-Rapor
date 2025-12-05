"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/alert"
import { useAuth } from "@/lib/auth-context"
import { nilaiApi } from "@/lib/api"
// Import Icon
import { 
  BookOpen, GraduationCap, Calendar, FileDown, 
  CheckCircle2, XCircle, Loader2, BarChart3 
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Import untuk Export PDF
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function NilaiPage() {
  const { user } = useAuth()
  const [nilai, setNilai] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedSemester, setSelectedSemester] = useState(1)

  useEffect(() => {
    const fetchNilai = async () => {
      try {
        if (!user?.id) return
        setLoading(true)
        const response = await nilaiApi.getNilaiBySiswa(user.id, selectedSemester.toString())
        const data = Array.isArray(response) ? response : (response as any).data || []
        setNilai(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data nilai")
      } finally {
        setLoading(false)
      }
    }

    fetchNilai()
  }, [user?.id, selectedSemester])

  const hitungRataRata = () => {
    if (nilai.length === 0) return 0
    const total = nilai.reduce((sum, n) => sum + parseFloat(n.nilai_angka), 0)
    return (total / nilai.length).toFixed(2)
  }

  // --- FUNGSI EXPORT PDF (UPDATE) ---
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Casting user ke 'any' agar bisa akses properti 'nisn' dari JSON API
    // Pastikan user object dari context memang membawa field 'nisn'
    const userData = user as any; 

    // 1. Judul Besar
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("LAPORAN HASIL BELAJAR SISWA", 105, 20, { align: "center" })
    
    // Garis Pembatas Header
    doc.setLineWidth(0.5)
    doc.line(14, 25, 196, 25)

    // 2. Info Siswa (Nama & NISN)
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    
    const startY = 35
    const lineHeight = 7

    // Ambil Nama & NISN
    doc.text(`Nama Siswa  : ${userData?.nama || userData?.name || "-"}`, 14, startY)
    
    // FIX: Ambil NISN dengan pengecekan nullish coalescing
    const nisnValue = userData?.nisn || "-"; 
    doc.text(`NISN        : ${nisnValue}`, 14, startY + lineHeight)
    
    doc.text(`Semester    : ${selectedSemester === 1 ? "1 (Ganjil)" : "2 (Genap)"}`, 14, startY + lineHeight * 2)
    // Tahun Ajar dihapus

    // 3. Tabel Data
    const tableColumn = ["No", "Mata Pelajaran", "KKM", "Nilai Akhir", "Keterangan"]
    const tableRows: any[] = []

    nilai.forEach((n, index) => {
      const nilaiAngka = parseFloat(n.nilai_angka)
      const kkm = n.kkm
      const status = nilaiAngka >= kkm ? "Tuntas" : "Tidak Tuntas"
      
      const rowData = [
        index + 1,
        n.nama_mapel,
        kkm,
        n.nilai_angka,
        status
      ]
      tableRows.push(rowData)
    })

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY + lineHeight * 3 + 5, 
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // No
        2: { halign: 'center', cellWidth: 20 }, // KKM
        3: { halign: 'center', cellWidth: 30, fontStyle: 'bold' }, // Nilai
        4: { halign: 'center', cellWidth: 35 }, // Status
      }
    })

    // 4. Footer Rata-rata
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFillColor(240, 253, 244) 
    doc.rect(14, finalY, 182, 15, 'F') 
    
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(22, 101, 52) 
    doc.text(`Rata-Rata Nilai Keseluruhan : ${hitungRataRata()}`, 105, finalY + 10, { align: "center" })
    
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.text(`Dicetak otomatis pada: ${new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, finalY + 25)

    const fileName = `Rapor_${userData?.nama || "Siswa"}_${nisnValue}.pdf`.replace(/\s+/g, "_");
    doc.save(fileName)
  }

  return (
    <ProtectedRoute requiredRoles={["siswa"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8">
            
            {/* Header Page */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <GraduationCap className="h-8 w-8 text-blue-600" /> Rapor Siswa
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Hasil pencapaian kompetensi peserta didik.
                </p>
              </div>
              
              {/* Filter & Export */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative w-full md:w-48">
                    <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                       <Calendar className="w-4 h-4" />
                    </div>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(Number.parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer appearance-none"
                    >
                      <option value={1}>Semester 1 (Ganjil)</option>
                      <option value={2}>Semester 2 (Genap)</option>
                    </select>
                 </div>
                 
                 <Button 
                   onClick={handleExportPDF} 
                   disabled={loading || nilai.length === 0}
                   className="bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <FileDown className="w-4 h-4 mr-2" /> Export PDF
                 </Button>
              </div>
            </div>

            {error && <Alert message={error} type="error" onClose={() => setError("")} />}

            {/* Content */}
            {loading ? (
               <div className="flex justify-center h-64 items-center flex-col gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="text-slate-500 font-medium">Memuat data nilai...</p>
               </div>
            ) : (
              <>
                {/* 1. TABEL NILAI */}
                <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider">Mata Pelajaran</th>
                          <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider">KKM</th>
                          <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider">Nilai Akhir</th>
                          <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {nilai.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                               <BookOpen className="h-12 w-12 mb-3 opacity-20" />
                               Tidak ada data nilai untuk semester ini.
                            </td>
                          </tr>
                        ) : (
                          nilai.map((n) => {
                            const nilaiAngka = parseFloat(n.nilai_angka)
                            const kkm = n.kkm
                            const isTuntas = nilaiAngka >= kkm

                            return (
                              <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-700">
                                   {n.nama_mapel}
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-mono">
                                   {n.kkm}
                                </td>
                                <td className="px-6 py-4">
                                   <span className="font-bold text-lg text-slate-800">{n.nilai_angka}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                      isTuntas 
                                        ? "bg-green-50 text-green-700 border-green-200" 
                                        : "bg-red-50 text-red-700 border-red-200"
                                   }`}>
                                      {isTuntas ? (
                                         <><CheckCircle2 className="w-3 h-3" /> Tuntas</>
                                      ) : (
                                         <><XCircle className="w-3 h-3" /> Remedial</>
                                      )}
                                   </span>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* 2. SUMMARY CARD (RATA-RATA) */}
                {nilai.length > 0 && (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg col-span-1 md:col-start-3">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Rata-Rata Semester {selectedSemester}</span>
                            <div className="p-2 bg-white/10 rounded-lg">
                               <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                         </div>
                         <div className="text-4xl font-extrabold tracking-tight text-white mt-2">
                            {hitungRataRata()}
                         </div>
                         <div className="mt-4 text-xs text-slate-400 border-t border-white/10 pt-3">
                            *Dihitung dari total {nilai.length} mata pelajaran.
                         </div>
                      </Card>
                   </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}