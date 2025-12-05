"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  LayoutDashboard, 
  Users, 
  School, 
  BookOpen, 
  GraduationCap, 
  UserCog, 
  ClipboardList,
  FileText,
  Menu
} from "lucide-react"

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  if (!user) return null

  const navLinks = {
    admin: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Manage Users", icon: Users },
      { href: "/admin/kelas", label: "Manage Kelas", icon: School },
      { href: "/admin/mapel", label: "Manage Mapel", icon: BookOpen },
      { href: "/admin/siswa", label: "Manage Siswa", icon: GraduationCap },
      { href: "/admin/guru", label: "Manage Guru", icon: UserCog },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
    ],
    guru: [
      { href: "/guru/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/guru/input-nilai", label: "Input Nilai", icon: FileText },
      { href: "/guru/nilai-siswa", label: "Lihat Nilai Siswa", icon: GraduationCap },
    ],
    siswa: [
      { href: "/siswa/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/siswa/nilai", label: "Lihat Nilai", icon: FileText },
    ],
  }

  const links = navLinks[user.role as keyof typeof navLinks] || []

  return (
    <>
      {/* TOMBOL BUKA (RE-OPEN) - Matches Navbar Color */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed top-3.5 left-2 z-[100] p-2 bg-slate-900 text-blue-500 rounded-lg border border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow-xl"
          title="Buka Menu"
        >
          <PanelLeftOpen className="h-6 w-6" />
        </button>
      )}

      {/* TOMBOL MOBILE */}
      <button 
        className="md:hidden fixed top-3 left-3 z-[100] p-2 bg-slate-900 text-white rounded-md shadow border border-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* SIDEBAR UTAMA */}
      <aside
        className={cn(
          // MATCHING COLORS: bg-slate-900 & border-slate-800
          "hidden md:flex flex-col border-r border-slate-800 bg-slate-900 text-slate-300 min-h-screen transition-all duration-300 ease-in-out relative shadow-xl sticky top-0 h-screen",
          isOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          
          {/* HEADER SIDEBAR */}
          <div className="flex items-center justify-between p-4 mb-2 border-b border-slate-800">
            <h2 className={cn("font-bold text-lg text-slate-100 tracking-wide transition-opacity duration-300", !isOpen && "opacity-0 hidden")}>
              Menu Utama
            </h2>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>

          {/* NAVIGASI LINKS */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    // Active: Biru Dashboard
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
                  
                  <span className={cn("whitespace-nowrap transition-all duration-300", !isOpen && "opacity-0 w-0")}>
                    {link.label}
                  </span>

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>
          
          <div className={cn("p-4 border-t border-slate-800 text-xs text-slate-600 text-center transition-opacity", !isOpen && "opacity-0 hidden")}>
             &copy; 2025 E-Rapor System
          </div>

        </div>
      </aside>
    </>
  )
}