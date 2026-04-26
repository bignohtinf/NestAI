'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MilkBabyImpact } from '@/components/metrics/milk-baby-impact';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function WellnessContent() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'trend' | 'impact' | 'checkup'>('trend');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (!mounted) return;
    const tab = searchParams.get('tab');
    if (tab === 'impact') {
      setActiveTab('impact');
    } else if (tab === 'checkup') {
      setActiveTab('checkup');
    } else {
      setActiveTab('trend');
    }
  }, [searchParams, mounted]);

  if (!mounted || !user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Theo Dõi Sức Khỏe</h1>
          <p className="text-muted-foreground">
            {user.babyStatus === 'pregnant'
              ? 'Theo dõi sức khỏe thai kỳ, chỉ số dinh dưỡng và lịch khám định kì'
              : 'Theo dõi xu hướng sữa, ảnh hưởng thực phẩm và khám định kì'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'trend' | 'impact' | 'checkup')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trend">
              <span className="hidden sm:inline">
                {user.babyStatus === 'pregnant' ? 'Sức khỏe thai kỳ' : 'Xu hướng'}
              </span>
              <span className="sm:hidden">Xu hướng</span>
            </TabsTrigger>
            <TabsTrigger value="impact">
              <span className="hidden sm:inline">Ảnh hưởng</span>
              <span className="sm:hidden">Ảnh hưởng</span>
            </TabsTrigger>
            <TabsTrigger value="checkup">
              <span className="hidden sm:inline">Khám định kì</span>
              <span className="sm:hidden">Khám</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <MilkBabyImpact activeTab="trend" />
          </TabsContent>

          <TabsContent value="impact">
            <MilkBabyImpact activeTab="impact" />
          </TabsContent>

          <TabsContent value="checkup">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cập nhật kết quả khám định kì</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default function WellnessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Wellness...</div>}>
      <WellnessContent />
    </Suspense>
  );
}
