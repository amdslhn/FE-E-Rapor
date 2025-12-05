"use client"

import { useState, useEffect } from "react"
import { authApi, usersApi } from "@/lib/api" 
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, School, KeyRound, Mail, Save, AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Alert } from "@/components/alert"

export default function UserProfileForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // State Password Visibility
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // State Notifikasi
  const [error, setError] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const [profileData, setProfileData] = useState({
    id: "", 
    nama: "",
    email: "",
    role: "",
    nomorInduk: "", 
    labelInduk: "ID User"
  })

  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const response: any = await authApi.authMe()
        const userData = response.user || response 

        let infoInduk = "-"
        let label = "ID User"

        if (userData.role === 'siswa') {
            infoInduk = userData.nisn || "Belum diatur"
            label = "NISN"
        } else if (userData.role === 'guru') {
            infoInduk = userData.nip || "Belum diatur"
            label = "NIP"
        } else if (userData.role === 'admin') {
            infoInduk = "-"
            label = "Administrator"
        }

        setProfileData({
            id: userData.id,
            nama: userData.nama,
            email: userData.email,
            role: userData.role,
            nomorInduk: infoInduk,
            labelInduk: label
        })

      } catch (error) {
        setError("Gagal memuat data profile.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])
  
  // Helper Modal Sukses
  const showSuccessPopup = (msg: string) => {
    setSuccessMessage(msg)
    setShowSuccessModal(true)
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 2500)
  }

  const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || "US"

  // LOGIKA GANTI PASSWORD
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
        setError("Mohon isi semua field password.");
        return
    }

    if (passData.newPassword !== passData.confirmPassword) {
        setError("Password baru dan konfirmasi tidak cocok!");
        return
    }

    setIsSaving(true)
    try {
        await usersApi.updatePassword(
            profileData.id, 
            passData.oldPassword, 
            passData.newPassword, 
            passData.confirmPassword
        )
        
        showSuccessPopup("Password berhasil diubah!");
        setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" })
        
    } catch (error: any) {
        const pesan = error.response?.data?.message || "Gagal mengganti password. Cek password lama Anda."
        setError(pesan)
    } finally {
        setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
        <div className="flex min-h-[60vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    )
  }

  return (
    <div className="flex justify-center items-start pt-10 pb-20 min-h-[calc(100vh-80px)] bg-slate-50/50">
      <Card className="w-full max-w-lg shadow-2xl border-slate-200 overflow-hidden relative border">
        
        {/* Header Dekoratif */}
        <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 w-full relative">
          <div className="absolute inset-0 bg-white/5 pattern-dots"></div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-16 relative z-10">
          <div className="p-1.5 bg-white rounded-full shadow-lg">
            <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-4xl border-4 border-white shadow-inner">
              {getInitials(profileData.nama)}
            </div>
          </div>
        </div>

        {/* Info Nama */}
        <div className="text-center mt-4 px-6">
          <h1 className="text-2xl font-bold text-slate-900 capitalize">{profileData.nama}</h1>
          <div className="flex justify-center gap-2 mt-2">
            <Badge className="bg-blue-600 text-white hover:bg-blue-700 uppercase px-3 tracking-wider font-bold shadow-md">
              {profileData.role}
            </Badge>
          </div>
        </div>

        <CardContent className="mt-8 px-8 pb-8">
          
          {/* FIX: RENDER ALERT DI DIV TERSENDIRI UNTUK SPACING */}
          {error && (
             <div className="mb-6">
                 <Alert message={error} type="error" onClose={() => setError("")} />
             </div>
          )}

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/80">
              <TabsTrigger value="info" className="font-semibold text-slate-700 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">Profile</TabsTrigger>
              <TabsTrigger value="security" className="font-semibold text-slate-700 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">Security</TabsTrigger>
            </TabsList>

            {/* Tab Info */}
            <TabsContent value="info" className="space-y-6 animate-in fade-in-50">
              {profileData.role !== 'admin' && (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                    {profileData.labelInduk}
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-700">
                    <School className="w-4 h-4 text-slate-400" />
                    <span className={!profileData.nomorInduk || profileData.nomorInduk === 'Belum diatur' ? "text-slate-400 italic" : "font-medium"}>
                      {profileData.nomorInduk}
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email Terdaftar</Label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{profileData.email}</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab Password */}
            <TabsContent value="security" className="animate-in fade-in-50">
              <form onSubmit={handlePasswordChange} className="space-y-5">
                
                {/* 1. PASSWORD LAMA */}
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-slate-700">Password Lama</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                        type={showOldPass ? "text" : "password"}
                        className="pl-9 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="••••••"
                        value={passData.oldPassword}
                        onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* 2. PASSWORD BARU */}
                <div className="space-y-1">
                  <Label className="sm font-semibold text-slate-700">Password Baru</Label>
                  <div className="relative">
                    <Input 
                        type={showNewPass ? "text" : "password"}
                        placeholder="Min. 8 karakter"
                        className="pr-10 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={passData.newPassword}
                        onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. ULANGI PASSWORD */}
                <div className="space-y-1">
                  <Label className="sm font-semibold text-slate-700">Ulangi Password</Label>
                  <div className="relative">
                    <Input 
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Ketik ulang password"
                        className="pr-10 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={passData.confirmPassword}
                        onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* TOMBOL SIMPAN (HIJAU) */}
                <Button 
                    type="submit" 
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/40 transition-all disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed" 
                    disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Password
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* --- MODAL SUKSES (POPUP TENGAH) --- */}
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
    </div>
  )
}