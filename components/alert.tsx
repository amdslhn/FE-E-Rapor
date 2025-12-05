"use client"

import toast from "react-hot-toast" // Import toast
import { useEffect } from "react" // Import useEffect

// Anda tidak perlu lagi prop onClose karena toast akan hilang otomatis

export function Alert({
  message,
  type = "info",
}: { message: string; type?: "success" | "error" | "info"; onClose?: () => void }) {
  
  if (!message) return null // Jika tidak ada pesan, tidak lakukan apa-apa

  // Gunakan useEffect untuk memanggil toast hanya sekali saat komponen pertama kali dirender
  // dengan pesan yang ada.
  useEffect(() => {
    // Tentukan fungsi toast mana yang akan dipanggil berdasarkan 'type'
    switch (type) {
      case "success":
        toast.success(message, { 
          duration: 4000, // Hilang otomatis setelah 4 detik
        })
        break
      case "error":
        toast.error(message, { 
          duration: 6000, // Error bia
        })
        break
      case "info":
      default:
        toast(message, { // toast() default untuk info
          duration: 4000,
        })
        break
    }
    
    // Karena komponen Alert Anda masih dirender di JSX file ManageUsers:
    // {success && <Alert message={success} type="success" onClose={() => setSuccess("")} />}
    // Ketika Alert ini selesai dirender, prop onClose akan dipanggil oleh ManageUsers, 
    // yang akan mereset state success/error di ManageUsers.

  }, [message, type])
  
  // Komponen ini tidak merender elemen visual di dalam DOM,
  // tetapi hanya memicu pop-up toast.
  return null
}