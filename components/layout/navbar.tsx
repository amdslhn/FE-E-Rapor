"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { GraduationCap, UserCircle, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  if (!user) return null

  const navLinks = {
    admin: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/users", label: "Manage Users" },
      { href: "/admin/kelas", label: "Manage Kelas" },
      { href: "/admin/siswa", label: "Manage Siswa" },
      { href: "/admin/guru", label: "Manage Guru" },
      { href: "/admin/mapel", label: "Manage Mapel" },
      { href: "/admin/audit-logs", label: "Audit Logs" },
    ],
    guru: [
      { href: "/guru/dashboard", label: "Dashboard" },
      { href: "/guru/input-nilai", label: "Input Nilai" },
      { href: "/guru/nilai-siswa", label: "Lihat Nilai Siswa" },
    ],
    siswa: [
      { href: "/siswa/dashboard", label: "Dashboard" },
      { href: "/siswa/nilai", label: "Lihat Nilai" },
    ],
  }

  const links = navLinks[user.role as keyof typeof navLinks] || []
  const profileLink = `/${user.role}/profile`

  return (
    // UBAH DISINI: Hapus gradient, pakai solid slate-900 biar match sama sidebar
    <nav className="bg-slate-900 border-b border-slate-800 text-white shadow-sm sticky top-0 z-50">
      
      <div className="w-full px-4 sm:px-8 py-3 flex items-center justify-between">
        
        {/* BAGIAN KIRI: Logo & Menu */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg hover:opacity-90 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-500" />
            <span className="text-xl tracking-tight text-slate-100">E-Rapor</span>
          </Link>

          <div className="hidden md:flex gap-1">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white text-slate-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* BAGIAN KANAN: PROFILE */}
        <div className="flex items-center gap-4">
          
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold leading-none text-slate-200">{user.name}</span>
            <span className="text-[10px] font-bold opacity-90 uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded mt-1 border border-slate-700 text-slate-400">
              {user.role}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-2 ring-offset-slate-900 focus:ring-2 focus:ring-blue-500">
              <UserCircle className="h-10 w-10 text-slate-400 hover:text-white hover:scale-105 transition-all cursor-pointer" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2 bg-slate-900 border-slate-800 text-slate-300 shadow-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                  <p className="text-xs leading-none text-slate-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-800 focus:text-white">
                <Link href={profileLink} className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Saya</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-800" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  )
}