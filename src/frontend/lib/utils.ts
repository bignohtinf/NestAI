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
