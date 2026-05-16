'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, type UserData } from '@/lib/context';

type Role = Exclude<UserData['role'], null>;

interface UseAuthGuardOptions {
  /**
   * Only allow these roles. Users with other roles are redirected to
   * `unauthorizedRedirect`. Omit to allow all authenticated roles.
   */
  allowedRoles?: Role[];
  /**
   * Block these roles. They are redirected to `unauthorizedRedirect`.
   * Useful when you want to exclude admins without listing every allowed role.
   */
  blockedRoles?: Role[];
  /** Where to send unauthenticated users. Default: '/auth/login' */
  loginRedirect?: string;
  /** Where to send users that fail the role check. Default: '/' */
  unauthorizedRedirect?: string;
}

interface UseAuthGuardReturn {
  /**
   * True only when auth is fully resolved AND the user passes all role
   * requirements. Use this as the single gate before rendering page content:
   *   if (!ready) return null;
   */
  ready: boolean;
  user: UserData | null;
  sessionStatus: ReturnType<typeof useApp>['sessionStatus'];
}

/**
 * Centralised auth + role guard for pages.
 *
 * Waits for `sessionStatus !== 'checking'` before making any redirect
 * decision, so the new Phase-1 parallel-fetch in AppProvider (which sets
 * user from JWT before the DB round-trip completes) doesn't cause false
 * redirects during the brief 'checking' window.
 *
 * Usage:
 *   const { ready, user } = useAuthGuard({ allowedRoles: ['mother'] });
 *   if (!ready) return null;
 */
export function useAuthGuard({
  allowedRoles,
  blockedRoles,
  loginRedirect = '/auth/login',
  unauthorizedRedirect = '/',
}: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const { user, sessionStatus } = useApp();
  const router = useRouter();

  // Stabilise options in a ref so the effect only re-runs when auth state
  // changes, not when a caller passes a new array literal on every render.
  const optsRef = useRef({ allowedRoles, blockedRoles, loginRedirect, unauthorizedRedirect });

  useEffect(() => {
    // Never redirect while the session is still being resolved.
    if (sessionStatus === 'checking') return;

    const { allowedRoles, blockedRoles, loginRedirect, unauthorizedRedirect } =
      optsRef.current;

    // Not authenticated → send to login.
    if (sessionStatus === 'unauthenticated' || !user) {
      router.push(loginRedirect);
      return;
    }

    // Role is null → user hasn't completed onboarding yet.
    // OnboardingGuard handles the redirect to /auth/role-selection; we just
    // stay quiet here so we don't conflict with it.
    if (user.role === null) return;

    // Role-based access checks.
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(unauthorizedRedirect);
      return;
    }
    if (blockedRoles && blockedRoles.includes(user.role)) {
      router.push(unauthorizedRedirect);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, user, router]);

  const passesRole =
    !!user?.role &&
    (!optsRef.current.allowedRoles || optsRef.current.allowedRoles.includes(user.role as Role)) &&
    (!optsRef.current.blockedRoles || !optsRef.current.blockedRoles.includes(user.role as Role));

  const ready = sessionStatus === 'authenticated' && !!user && passesRole;

  return { ready, user, sessionStatus };
}
