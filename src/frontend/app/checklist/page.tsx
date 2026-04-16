'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { ActionChecklist } from '@/components/metrics/action-checklist';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChecklistPage() {
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
          <h1 className="text-3xl font-bold">Checklist</h1>
          <p className="text-muted-foreground">Danh sách công việc hôm nay</p>
        </div>

        <ActionChecklist />
      </div>
    </MainLayout>
  );
}
