'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { MilkBabyImpact } from '@/components/metrics/milk-baby-impact';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WellnessPage() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'trend' | 'impact' | 'checkup'>('trend');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'impact') {
      setActiveTab('impact');
    } else if (tab === 'checkup') {
      setActiveTab('checkup');
    } else {
      setActiveTab('trend');
    }
  }, [searchParams]);

  if (!user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {(activeTab === 'trend' || activeTab === 'impact') && (
          <MilkBabyImpact activeTab={activeTab} />
        )}

        {activeTab === 'checkup' && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cập nhật kết quả khám định kì</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
