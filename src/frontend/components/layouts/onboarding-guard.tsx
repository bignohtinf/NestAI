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
  const { user, sessionStatus } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until auth is fully resolved before making any redirect decision.
    // While status is 'checking', user.role may be null simply because the
    // DB enrichment (Phase 2) hasn't returned yet — redirecting here would
    // incorrectly send returning users to the role-selection page.
    if (sessionStatus !== 'authenticated') return;
    if (!user) return;
    if (EXCLUDED_PATHS.some(p => pathname.startsWith(p))) return;

    // User authenticated but has never selected a role → force role selection.
    if (!user.role) {
      router.push('/auth/role-selection');
    }
  }, [user, sessionStatus, pathname, router]);

  return <>{children}</>;
}
