'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';

export function useAdminCheck() {
  const router = useRouter();
  const { user, isLoading } = useApp();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (isLoading) return;

      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (user.role === 'admin') {
        setIsAdmin(true);
        setChecking(false);
        return;
      }

      // If user exists but is not admin, redirect to home
      router.push('/');
      setChecking(false);
    };

    checkAdminRole();
  }, [user, isLoading, router]);

  return { isAdmin, checking, user };
}
