"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/alert";
import { mapelApi } from "@/lib/api";
import { 
  AlertTriangle, Pencil, Trash2, Plus, X, Save, 
  BookOpen, Loader2, CheckCircle2, Search 
} from "lucide-react";

export default function ManageMapel() {
  const [mapelList, setMapelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Loading Tombol
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [error, setError] = useState("");
  
  // State Form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: "", nama_mapel: "", kkm: 75 });
  const [editId, setEditId] = useState<string | null>(null);

  // State Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Modal Sukses State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // State Searching
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    fetchMapel();
  }, []);

  const fetchMapel = async () => {
    setLoading(true);
    try {
      const data = await mapelApi.getAll();
      setMapelList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch mapel");
    } finally {
      setLoading(false);
    }
  };

  // LOGIC FILTERING (Client-Side)
  const filteredMapel = mapelList.filter(mapel => {
    const term = searchTerm.toLowerCase();
    return (
      mapel.nama_mapel.toLowerCase().includes(term) ||
      mapel.id.toLowerCase().includes(term)
    );
  });

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
    setError("");

    try {
      if (editId) {
        await mapelApi.update(editId, formData);
        showSuccessPopup("Data Mapel berhasil diperbarui!");
        setEditId(null);
      } else {
        await mapelApi.create(formData);
        showSuccessPopup("Mapel baru berhasil ditambahkan!");
      }
      setFormData({ id: "", nama_mapel: "", kkm: 75 });
      setShowForm(false);
      fetchMapel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
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
      await mapelApi.delete(deleteId);
      showSuccessPopup("Mapel berhasil dihapus permanen.");
      fetchMapel();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (mapel: any) => {
    setFormData({ id: mapel.id, nama_mapel: mapel.nama_mapel, kkm: mapel.kkm });
    setEditId(mapel.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50/50 relative">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 relative">
            
            {/* Header Page */}
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                   <BookOpen className="h-8 w-8 text-blue-600" /> Manage Mapel
                 </h1>
                 <p className="text-slate-500 mt-1">Kelola data mata pelajaran dan KKM.</p>
              </div>
              
              {!showForm && (
                <Button
                  onClick={() => {
                    setShowForm(true);
                    setEditId(null);
                    setFormData({ id: "", nama_mapel: "", kkm: 75 });
                  }}
                  className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 text-white cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Mapel
                </Button>
              )}
            </div>

            {/* --- SEARCH BAR (NEW) --- */}
            <div className="mb-8 max-w-lg relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder={`Cari mata pelajaran dari total ${mapelList.length} berdasarkan nama atau kode...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-md"
                />
            </div>
            {/* --- END SEARCH BAR --- */}
            
            {/* ERROR ALERT */}
            {error && <Alert message={error} type="error" onClose={() => setError("")} />}

            {/* --- FORM AREA --- */}
            {showForm && (
              <Card className="mb-8 border-none shadow-xl bg-white overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      {editId ? <Pencil className="h-4 w-4 text-blue-500"/> : <Plus className="h-4 w-4 text-green-500"/>}
                      {editId ? "Edit Informasi Mapel" : "Buat Mapel Baru"}
                   </h2>
                   <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0 cursor-pointer">
                      <X className="h-5 w-5" />
                   </Button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Kode Mapel */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Kode Mapel</label>
                        <input
                          type="text"
                          value={formData.id}
                          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                          placeholder="e.g., MTK"
                          required
                          disabled={!!editId}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Nama Mapel */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Nama Mapel</label>
                        <input
                          type="text"
                          value={formData.nama_mapel}
                          onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                          placeholder="e.g., Matematika Wajib"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>

                      {/* KKM */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">KKM (0-100)</label>
                        <input
                          type="number"
                          value={formData.kkm}
                          onChange={(e) => setFormData({ ...formData, kkm: Number.parseInt(e.target.value) })}
                          min="0"
                          max="100"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                              {editId ? "Simpan Perubahan" : "Simpan Mapel"}
                            </>
                          )}
                       </Button>
                    </div>
                  </form>
                </div>
              </Card>
            )}

            {/* --- LIST MAPEL (GRID) --- */}
            {loading ? (
              <div className="flex justify-center h-40 items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMapel.map((mapel) => (
                  <Card 
                    key={mapel.id} 
                    className="group relative overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
                  >
                    <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                          <BookOpen className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                           {mapel.id}
                        </div>
                      </div>

                      <div className="mb-4">
                         <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1">{mapel.nama_mapel}</h3>
                         <p className="text-sm text-slate-500 font-medium">Standard KKM: <span className="text-slate-900 font-bold">{mapel.kkm}</span></p>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0 pt-4 border-t border-dashed border-slate-100">
                        <Button 
                          onClick={() => handleEdit(mapel)} 
                          size="sm" 
                          variant="outline"
                          className="flex-1 hover:bg-blue-50 hover:text-blue-600 border-slate-200 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 mr-1.5" /> Edit
                        </Button>
                        <Button 
                          onClick={() => triggerDelete(mapel.id)} 
                          variant="ghost" 
                          size="sm"
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
               <h3 className="text-2xl font-bold text-slate-900 mb-3">Berhasil!</h3>
               <p className="text-slate-600 leading-relaxed font-medium">
                 {successMessage}
               </p>
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
                <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Mapel Ini?</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Data yang dihapus tidak dapat dikembalikan lagi.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  className="inline-flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
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
  )
}