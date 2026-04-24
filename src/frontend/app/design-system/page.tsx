'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Design system page temporarily disabled — redirect to home
export default function DesignSystemPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
