'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';

// Các path không cần guard (auth pages, public pages)
const EXCLUDED_PATHS = [
  '/auth/role-selection',
  '/auth/login',
  '/auth/signup',
  '/privacy',
  '/terms',
  '/support',
  '/contact',
];

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Bỏ qua nếu user chưa load xong hoặc đang ở trang excluded
    if (!user) return;
    if (EXCLUDED_PATHS.some(p => pathname.startsWith(p))) return;

    // User đã đăng nhập nhưng chưa chọn role → bắt buộc chọn role
    if (!user.role) {
      router.push('/auth/role-selection');
    }
  }, [user, pathname, router]);

  return <>{children}</>;
}
