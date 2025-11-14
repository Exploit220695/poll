import { formatDistanceToNow, format as formatDate } from "date-fns";
import { id as localeId } from "date-fns/locale";

// Timezone Indonesia Bagian Barat (WIB) = UTC+7
export const WIB_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

// Convert UTC to WIB
export function toWIB(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return new Date(utcDate.getTime() + WIB_OFFSET);
}

// Format date untuk display di Indonesia
export function formatWIBDate(date: Date | string, formatStr: string = "dd/MM/yyyy HH:mm:ss"): string {
  const wibDate = toWIB(date);
  return formatDate(wibDate, formatStr, { locale: localeId });
}

// Format relative time dalam bahasa Indonesia
export function formatDistanceToNowWIB(date: Date | string): string {
  const wibDate = toWIB(date);
  const now = toWIB(new Date());
  
  return formatDistanceToNow(wibDate, { 
    addSuffix: true, 
    locale: localeId,
    includeSeconds: true
  });
}

// Get current WIB time
export function getCurrentWIB(): Date {
  return toWIB(new Date());
}

// Format untuk display jam di Indonesia
export function formatWIBTime(date: Date | string): string {
  return formatWIBDate(date, "HH:mm:ss 'WIB'");
}

// Format untuk display tanggal lengkap
export function formatWIBDateTime(date: Date | string): string {
  return formatWIBDate(date, "EEEE, dd MMMM yyyy 'pukul' HH:mm:ss 'WIB'");
}