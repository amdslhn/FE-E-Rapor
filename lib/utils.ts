import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function toWIB(dateString: any) {
  if (!dateString || typeof dateString !== "string") return "-";

  let date: Date;

  // CASE 1: PostgreSQL timestamp "2025-12-02 15:01:08"
  if (dateString.includes(" ") && !dateString.includes("T")) {
    const [datePart, timePart] = dateString.split(" ");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  // CASE 2: ISO string "2025-12-02T08:10:11.530Z"
  else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) return "-";

  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return wib.toLocaleString("id-ID", { hour12: false });
}




export { toWIB }


