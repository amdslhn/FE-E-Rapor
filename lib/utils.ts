import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function toWIB(dateString: any) {
  if (!dateString) return "-";

  // 1. Pastikan input menjadi object Date yang valid
  let date: Date;

  if (typeof dateString === "string") {
    // CASE 1: Jika format dari DB "2025-12-02 15:01:08" (tanpa T dan Z)
    // Kita paksa tambahkan "Z" di akhir agar dibaca sebagai UTC, bukan waktu lokal laptop.
    if (dateString.includes(" ") && !dateString.includes("Z")) {
       // Ubah spasi jadi T dan tambah Z: "2025-12-02T15:01:08Z"
       date = new Date(dateString.replace(" ", "T") + "Z");
    } else {
       // CASE 2: ISO String standard
       date = new Date(dateString);
    }
  } else if (dateString instanceof Date) {
      date = dateString;
  } else {
      return "-";
  }

  // Cek apakah tanggal valid
  if (isNaN(date.getTime())) return "-";

  // 2. Format output langsung ke Asia/Jakarta menggunakan Intl API
  // Ini cara paling aman dan standar di JavaScript modern
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", // <--- INI KUNCINYA (Otomatis +7)
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Format 24 jam
  }).format(date).replace(/\./g, ":"); // Ubah pemisah waktu dari titik (.) jadi titik dua (:) biar rapi
}



export { toWIB }


