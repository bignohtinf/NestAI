'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Legacy redirect: /planner → /nutrition-report
 * Trang này đã được thay thế bởi Báo cáo Dinh dưỡng.
 */
export default function PlannerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/nutrition-report');
  }, [router]);

  return null;
}
