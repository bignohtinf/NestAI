'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { BudgetOptimization } from '@/components/metrics/budget-optimization';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BudgetPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'father') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'father') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kinh phí</h1>
          <p className="text-muted-foreground">Quản lý chi tiêu và tối ưu hóa ngân sách</p>
        </div>

        <BudgetOptimization />
      </div>
    </MainLayout>
  );
}
