import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tuần thai thống nhất: "8 tuần 5 ngày" hoặc "8 tuần" nếu không có ngày lẻ.
 * Dùng cho header, dashboard KPI, profile — đảm bảo hiển thị đồng nhất.
 */
export function formatGestationAge(weeks?: number | null, days?: number | null): string {
  if (weeks == null) return '—';
  if (days && days > 0) return `${weeks} tuần ${days} ngày`;
  return `${weeks} tuần`;
}

/**
 * Tính tuần thai và số ngày lẻ client-side (browser) từ LMP hoặc EDD.
 *
 * Ưu tiên LMP nếu có (chính xác nhất).
 * Fallback sang EDD nếu không có LMP.
 *
 * Dùng timezone của browser (cùng với header) để tránh lệch ngày so với
 * Python server-side (FastAPI dùng date.today() theo timezone của server,
 * có thể khác với timezone của Next.js hoặc browser).
 */
export function calculateGestationAge(
  lmp: string | null | undefined,
  edd: string | null | undefined
): { weeks: number | null; daysInWeek: number | null } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (lmp) {
    const lmpDate = new Date(lmp);
    lmpDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lmpDate.getTime()) / 86400000);
    return {
      weeks: Math.max(0, Math.min(42, Math.floor(daysDiff / 7))),
      daysInWeek: Math.max(0, daysDiff % 7),
    };
  }

  if (edd) {
    const eddDate = new Date(edd);
    eddDate.setHours(0, 0, 0, 0);
    const daysToGo = Math.floor((eddDate.getTime() - today.getTime()) / 86400000);
    const totalDays = 280 - daysToGo;
    return {
      weeks: Math.max(0, Math.min(42, Math.floor(totalDays / 7))),
      daysInWeek: Math.max(0, totalDays % 7),
    };
  }

  return { weeks: null, daysInWeek: null };
}
