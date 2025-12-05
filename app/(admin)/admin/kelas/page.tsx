"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/alert";
import { kelasApi } from "@/lib/api";
import { 
  AlertTriangle, Pencil, Trash2, Plus, X, Save, 
  CheckCircle2, Loader2, School, Search 
} from "lucide-react";

export default function ManageKelas() {
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Loading Tombol
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [error, setError] = useState("");
  
  // State Filtering
  const [searchTerm, setSearchTerm] = useState(''); 

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nama_kelas: "",
    tingkat: "10",
    jurusan: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  // Modal Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal Success State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    setLoading(true);
    try {
      const data = await kelasApi.getAll();
      setKelasList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch kelas");
    } finally {
      setLoading(false);
    }
  };

  // LOGIC FILTERING
  const filteredKelas = kelasList.filter(kelas => {
    const term = searchTerm.toLowerCase();
    return (
      kelas.nama_kelas.toLowerCase().includes(term) ||
      kelas.jurusan.toLowerCase().includes(term) ||
      kelas.tingkat.toLowerCase().includes(term)
    );
  });

  // Helper untuk memunculkan Modal Sukses
  const showSuccessPopup = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(""); // Reset error jika ada

    try {
      if (editId) {
        await kelasApi.update(editId, {
          nama: formData.nama_kelas,
          tingkat: formData.tingkat,
          jurusan: formData.jurusan,
        });
        showSuccessPopup("Data kelas berhasil diperbarui!");
        setEditId(null);
      } else {
        await kelasApi.create(formData);
        showSuccessPopup("Kelas baru berhasil dibuat!");
      }
      setFormData({ id: "", nama_kelas: "", tingkat: "10", jurusan: "" });
      setShowForm(false);
      fetchKelas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kelas");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await kelasApi.delete(deleteId);
      showSuccessPopup("Kelas berhasil dihapus permanen.");
      fetchKelas();
      setShowDeleteModal(false); // Tutup modal jika sukses
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kelas");
      setShowDeleteModal(false); // Tutup modal biar user liat alert error
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (kelas: any) => {
    setFormData({
      id: kelas.id,
      nama_kelas: kelas.nama_kelas,
      tingkat: kelas.tingkat,
      jurusan: kelas.jurusan,
    });
    setEditId(kelas.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 relative">
            
            {/* Header Page */}
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <School className="h-8 w-8 text-blue-600" /> Manage Kelas
                 </h1>
                 <p className="text-slate-500 mt-1">Atur data kelas, tingkat, dan jurusan.</p>
              </div>
              
              {!showForm && (
                <Button
                  onClick={() => {
                    setShowForm(true);
                    setEditId(null);
                    setFormData({ id: "", nama_kelas: "", tingkat: "10", jurusan: "" });
                  }}
                  className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 text-white cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
                </Button>
              )}
            </div>

            {/* --- SEARCH BAR (NEW) --- */}
            <div className="mb-8 max-w-lg relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder={`Cari kelas dari total ${kelasList.length} kelas berdasarkan nama, tingkat, atau jurusan...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-md"
                />
            </div>
            {/* --- END SEARCH BAR --- */}

            {/* Error Alert */}
            {error && <Alert message={error} type="error" onClose={() => setError("")} />}

            {/* --- FORM AREA --- */}
            {showForm && (
              <Card className="mb-8 border-none shadow-xl bg-white overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      {editId ? <Pencil className="h-4 w-4 text-blue-500"/> : <Plus className="h-4 w-4 text-green-500"/>}
                      {editId ? "Edit Informasi Kelas" : "Buat Kelas Baru"}
                   </h2>
                   <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0 cursor-pointer">
                      <X className="h-5 w-5" />
                   </Button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* ID Kelas */}
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                          ID Kelas
                        </label>
                        <input
                          type="text"
                          value={formData.id}
                          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                          placeholder="Ex: 10IPA1"
                          required
                          disabled={!!editId}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Nama Kelas */}
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                          Nama Kelas
                        </label>
                        <input
                          type="text"
                          value={formData.nama_kelas}
                          onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                          placeholder="Ex: X IPA 1"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </div>

                      {/* Tingkat */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                          Tingkat
                        </label>
                        <div className="relative">
                          <select
                            value={formData.tingkat}
                            onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none cursor-pointer appearance-none"
                          >
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                          </select>
                          <div className="absolute right-3 top-3 pointer-events-none">
                             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>

                      {/* Jurusan */}
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                          Jurusan
                        </label>
                        <input
                          type="text"
                          value={formData.jurusan}
                          onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                          placeholder="Ex: IPA / MIPA"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                       <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setShowForm(false)}
                          disabled={isSubmitting}
                          className="text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          Batal
                       </Button>
                       
                       {/* BUTTON SIMPAN */}
                       <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 px-6 min-w-[140px] cursor-pointer disabled:cursor-not-allowed"
                       >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {editId ? "Simpan Perubahan" : "Simpan Kelas Baru"}
                            </>
                          )}
                       </Button>
                    </div>
                  </form>
                </div>
              </Card>
            )}

            {/* --- LIST KELAS (GRID CARD) --- */}
            {loading ? (
              <div className="flex justify-center h-40 items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredKelas.map((kelas) => (
                  <Card
                    key={kelas.id}
                    className="group relative overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
                  >
                    <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kelas</p>
                           <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                             {kelas.nama_kelas}
                           </h3>
                        </div>
                        <div className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                           {kelas.tingkat}
                        </div>
                      </div>
                      
                      <div className="mb-6 pb-6 border-b border-dashed border-slate-200">
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                           Jurusan: <span className="font-semibold text-slate-700">{kelas.jurusan || "-"}</span>
                        </p>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(kelas)}
                          className="flex-1 hover:bg-blue-50 hover:text-blue-600 border-slate-200 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 mr-1.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => triggerDelete(kelas.id)}
                          className="flex-1 hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 mr-1.5" /> Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* --- 1. MODAL SUKSES (HIJAU) --- */}
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

        {/* --- 2. MODAL DELETE (MERAH + LOADING) --- */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 animate-in zoom-in-95 border border-slate-100">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4 animate-pulse">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Kelas Ini?</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Data kelas yang dihapus tidak dapat dikembalikan. Siswa dalam kelas ini mungkin akan kehilangan referensi kelas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  className="inline-flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  className="inline-flex w-full justify-center items-center rounded-xl bg-red-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer"
                  onClick={confirmDelete}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}