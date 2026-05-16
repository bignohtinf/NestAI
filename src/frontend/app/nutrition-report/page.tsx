'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { formatGestationAge } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NutritionDashboard } from '@/components/metrics/nutrition-dashboard';
import { MealLogHistory } from '@/components/metrics/meal-log-history';
import { LayoutDashboard, ClipboardList } from 'lucide-react';

function NutritionReportPageInner() {
  const { ready, user } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  // Resolve targetUserId — father xem data mẹ, mother xem data mình
  useEffect(() => {
    if (!ready || !user) return;

    if (user.role === 'father') {
      fetch(`/api/partnerships/active?user_id=${user.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.partnership?.mother_id) {
            setTargetUserId(data.partnership.mother_id);
          }
        })
        .catch(err => console.error('Failed to resolve partner:', err));
    } else {
      setTargetUserId(user.id);
    }
  }, [ready, user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'history' ? 'history' : 'overview');
  }, [searchParams]);

  if (!ready) return null;

  // Tuần thai lấy từ context — cùng nguồn với header, đã được tính live
  const gestationWeeks = user.gestationWeeks;
  const daysInWeek = user.daysInWeek;
  const trimester = user.trimester;

  return (
    <MainLayout fullWidth>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {user.role === 'father' ? 'Báo cáo Dinh dưỡng của Mẹ' : 'Báo cáo Dinh dưỡng'}
            </h1>
            <p className="text-muted-foreground mt-1">Theo dõi và tối ưu dinh dưỡng cho mẹ và bé</p>
          </div>
          {gestationWeeks != null && (
            <div className="flex items-center gap-2 text-sm bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
              <span className="font-semibold text-primary">
                {trimester ? `Tam cá nguyệt ${trimester}` : ''} • {formatGestationAge(gestationWeeks, daysInWeek)}
              </span>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const tab = value as 'overview' | 'history';
            setActiveTab(tab);
            const params = new URLSearchParams(searchParams.toString());
            if (tab === 'overview') {
              params.delete('tab');
            } else {
              params.set('tab', tab);
            }
            const query = params.toString();
            router.replace(`/nutrition-report${query ? `?${query}` : ''}`, { scroll: false });
          }}
          className="space-y-6"
        >
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="overview" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Tổng Quan
            </TabsTrigger>
            <TabsTrigger value="history" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              Nhật Ký
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="focus-visible:outline-none">
            <NutritionDashboard targetUserId={targetUserId} gestationWeeks={gestationWeeks} />
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none">
            <MealLogHistory targetUserId={targetUserId} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default function NutritionReportPage() {
  return (
    <Suspense fallback={null}>
      <NutritionReportPageInner />
    </Suspense>
  );
}
