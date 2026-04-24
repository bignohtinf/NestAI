'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';

// Pages that are always accessible (no profile required)
const BYPASS_PATHS = ['/auth/login', '/auth/signup', '/auth/role-selection', '/profile'];

/**
 * OnboardingGuard
 *
 * After login, if the user is a "mother" and has NOT yet set their dueDate
 * (pregnancy profile), redirect them to /profile (pregnancy tab) so they
 * complete the profile before accessing any other page.
 *
 * This guard only runs once the auth state has settled (isLoading = false).
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in — let other guards handle redirect
    if (!user) return;

    // Only enforce onboarding for mothers
    if (user.role !== 'mother') return;

    // Already on an allowed page
    if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) return;

    // Check if profile is incomplete (no dueDate set)
    const profileIncomplete = !user.dueDate && !user.gestationWeeks;
    if (profileIncomplete) {
      router.replace('/profile?onboarding=1');
    }
  }, [isLoading, user, pathname, router]);

  return <>{children}</>;
}
