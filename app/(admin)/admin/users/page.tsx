"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/alert"
import { usersApi } from "@/lib/api"
import { 
  AlertTriangle, UserPlus, Pencil, Trash2, Users, RefreshCw, X, 
  Shield, Mail, User, GraduationCap, Save, CheckCircle2, Loader2, Search,
  CreditCard // Icon baru untuk NIP/NISN
} from "lucide-react"

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // State Loading Tombol
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [error, setError] = useState("")
  
  // Modal Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // State Filtering
  const [searchTerm, setSearchTerm] = useState('')

  // Form State - Update: Menambahkan nip dan nisn
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ 
    nama: "", 
    email: "", 
    role: "siswa",
    nip: "",  // Default kosong
    nisn: ""  // Default kosong
  })

  // Edit State
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editRole, setEditRole] = useState("")
  // State baru untuk input NIP/NISN saat edit role
  const [editIdentifier, setEditIdentifier] = useState("") 

  // State Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  // LOGIC FILTERING
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
        user.nama.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  });

  const showSuccessPopup = (msg: string) => {
    setSuccessMessage(msg)
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 2000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // API call akan mengirim nip/nisn sesuai state formData
      await usersApi.create(formData)
      showSuccessPopup("User baru berhasil dibuat!")
      // Reset form termasuk nip dan nisn
      setFormData({ nama: "", email: "", role: "siswa", nip: "", nisn: "" })
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerDelete = (id: string) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await usersApi.delete(deleteId)
      showSuccessPopup("User berhasil dihapus permanen.")
      fetchUsers()
      setShowDeleteModal(false)
      setDeleteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditModal = (user: any) => {
    setEditingUser(user)
    setEditRole(user.role) 
    // Reset identifier saat buka modal. Jika role sama, mungkin bisa diisi existing (opsional), 
    // tapi karena fokusnya ganti role -> input baru, kita kosongkan dulu.
    setEditIdentifier("") 
    setError("")
  }

  const handleUpdateRole = async () => {
    if (!editingUser) return
    
    setIsSubmitting(true)
    setError("") // Reset error

    try {
      const payload: any = { role: editRole }

      // LOGIC: Jika ubah ke GURU dari role lain -> Wajib NIP, Hapus NISN
      if (editRole === 'guru' && editingUser.role !== 'guru') {
        if (!editIdentifier.trim()) {
           throw new Error("Wajib mengisi NIP untuk role Guru.")
        }
        payload.nip = editIdentifier
        payload.nisn = null // Hapus NISN lama di backend
      }

      // LOGIC: Jika ubah ke SISWA dari role lain -> Wajib NISN, Hapus NIP
      if (editRole === 'siswa' && editingUser.role !== 'siswa') {
        if (!editIdentifier.trim()) {
           throw new Error("Wajib mengisi NISN untuk role Siswa.")
        }
        payload.nisn = editIdentifier
        payload.nip = null // Hapus NIP lama di backend
      }

      await usersApi.update(editingUser.id, payload) 
      
      showSuccessPopup(`Role ${editingUser.nama} berhasil diubah menjadi ${editRole}`)
      setEditingUser(null) 
      fetchUsers() 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4 text-red-500" />
      case "guru": return <User className="w-4 h-4 text-blue-500" />
      case "siswa": return <GraduationCap className="w-4 h-4 text-green-500" />
      default: return <User className="w-4 h-4" />
    }
  }

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
                   <Users className="h-8 w-8 text-blue-600" /> Manage Users
                 </h1>
                 <p className="text-slate-500 mt-1">Kelola akun pengguna, guru, dan siswa.</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={fetchUsers} 
                  variant="outline" 
                  size="sm" 
                  className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                {!showForm && (
                  <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 text-white cursor-pointer">
                    <UserPlus className="h-4 w-4 mr-2" /> Add User
                  </Button>
                )}
              </div>
            </div>

            {/* --- SEARCH BAR (NEW) --- */}
            <div className="mb-8 max-w-lg relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder={`Cari pengguna dari total ${users.length} pengguna berdasarkan nama atau email...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-md"
                />
            </div>
            {/* --- END SEARCH BAR --- */}
            
            {error && !editingUser && <Alert message={error} type="error" onClose={() => setError("")} />}

            {/* --- FORM CREATE USER --- */}
            {showForm && (
              <Card className="mb-8 border-none shadow-xl bg-white overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-green-600"/> Tambah User Baru
                   </h2>
                   <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0 cursor-pointer">
                      <X className="h-5 w-5" />
                   </Button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Nama */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Nama Lengkap</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            required
                            placeholder="John Doe"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="email@sekolah.sch.id"
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1 flex items-center gap-1">
                           Role
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-3 pointer-events-none">
                             {getRoleIcon(formData.role)}
                          </div>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value, nip: "", nisn: "" })} // Reset NIP/NISN saat ganti role
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all cursor-pointer appearance-none"
                          >
                            <option value="admin">Admin System</option>
                            <option value="guru">Guru Pengajar</option>
                            <option value="siswa">Siswa</option>
                          </select>
                          <div className="absolute right-3 top-3 pointer-events-none">
                             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>

                      {/* --- LOGIC TAMBAHAN: NIP / NISN --- */}
                      
                      {/* Input untuk GURU: Wajib NIP */}
                      {formData.role === "guru" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-xs font-bold uppercase text-blue-600 mb-1.5 ml-1">NIP (Wajib)</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text" // Bisa 'number' jika ingin validasi angka saja
                              value={formData.nip}
                              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                              required // Logic: Wajib diisi
                              placeholder="Masukkan NIP Guru"
                              className="w-full pl-9 pr-4 py-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Input untuk SISWA: Wajib NISN */}
                      {formData.role === "siswa" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-xs font-bold uppercase text-green-600 mb-1.5 ml-1">NISN (Wajib)</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text" // Bisa 'number' jika ingin validasi angka saja
                              value={formData.nisn}
                              onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                              required // Logic: Wajib diisi
                              placeholder="Masukkan NISN Siswa"
                              className="w-full pl-9 pr-4 py-2.5 bg-green-50/50 border border-green-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* --- END LOGIC TAMBAHAN --- */}

                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                        <Button type="button" variant="ghost" onClick={() => setShowForm(false)} disabled={isSubmitting} className="cursor-pointer">Batal</Button>
                        
                        <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 px-6 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" /> Simpan User</>
                          )}
                        </Button>
                    </div>
                  </form>
                </div>
              </Card>
            )}

            {/* --- TABEL USERS --- */}
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
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Nama User</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Email</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Role</th>
                        <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Tidak ada user yang cocok dengan pencarian.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-slate-700">{user.nama}</td>
                            <td className="px-6 py-4 text-slate-500">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                                user.role === "admin"
                                  ? "bg-red-50 text-red-700 border-red-100"
                                  : user.role === "guru"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : "bg-green-50 text-green-700 border-green-100"
                              }`}>
                                {getRoleIcon(user.role)}
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  onClick={() => openEditModal(user)} 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Role
                                </Button>
                                
                                <Button 
                                  onClick={() => triggerDelete(user.id)} 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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

        {/* --- MODAL UPDATE ROLE --- */}
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md bg-white shadow-2xl border-none overflow-hidden scale-100 animate-in zoom-in-95">
              
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Ubah Role User</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0 cursor-pointer">
                   <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Info User */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1">Target User</p>
                   <p className="font-semibold text-slate-800">{editingUser.nama}</p>
                   <p className="text-xs text-slate-500">{editingUser.email}</p>
                   <div className="mt-2 text-xs flex gap-2">
                      <span className="font-bold">Role Saat Ini:</span> 
                      <span className="uppercase">{editingUser.role}</span>
                   </div>
                </div>

                {/* Error in Modal */}
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex gap-2 items-start"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}</div>}

                {/* Select Role */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Role Baru</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 pointer-events-none">
                       {getRoleIcon(editRole)}
                    </div>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer transition-all appearance-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="guru">Guru</option>
                      <option value="siswa">Siswa</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none">
                       <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* --- LOGIC EDIT ROLE: Wajib NIP/NISN saat ganti role --- */}
                
                {/* CASE: Mengubah ke GURU (jika sebelumnya bukan guru) */}
                {editRole === 'guru' && editingUser.role !== 'guru' && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-semibold text-blue-600 mb-2">NIP Baru (Wajib)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input 
                           type="text" 
                           value={editIdentifier}
                           onChange={(e) => setEditIdentifier(e.target.value)}
                           className="w-full pl-9 pr-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                           placeholder="Masukkan NIP Guru..."
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 italic">*Data NISN lama akan dihapus.</p>
                   </div>
                )}

                {/* CASE: Mengubah ke SISWA (jika sebelumnya bukan siswa) */}
                {editRole === 'siswa' && editingUser.role !== 'siswa' && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-semibold text-green-600 mb-2">NISN Baru (Wajib)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input 
                           type="text" 
                           value={editIdentifier}
                           onChange={(e) => setEditIdentifier(e.target.value)}
                           className="w-full pl-9 pr-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                           placeholder="Masukkan NISN Siswa..."
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 italic">*Data NIP lama akan dihapus.</p>
                   </div>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-50 mt-2">
                  <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={isSubmitting} className="cursor-pointer">Batal</Button>
                  <Button 
                    onClick={handleUpdateRole} 
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 shadow-md text-white cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- MODAL SUKSES --- */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
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

        {/* --- MODAL DELETE (Async) --- */}
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
                <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus User Ini?</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Tindakan ini permanen. Data user beserta riwayatnya akan dihapus dari sistem.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  className="inline-flex w-full justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
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