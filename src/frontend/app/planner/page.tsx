'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetOptimization } from '@/components/metrics/budget-optimization';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PlannerPage() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'budget' | 'missions'>('budget');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'father') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (!mounted) return;
    const tab = searchParams.get('tab');
    if (tab === 'missions') {
      setActiveTab('missions');
    } else {
      setActiveTab('budget');
    }
  }, [searchParams, mounted]);

  if (!mounted || !user || user.role !== 'father') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kế Hoạch</h1>
          <p className="text-muted-foreground">Quản lý ngân sách và nhiệm vụ</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'budget' | 'missions')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budget">Ngân Sách</TabsTrigger>
            <TabsTrigger value="missions">Nhiệm Vụ</TabsTrigger>
          </TabsList>

          <TabsContent value="budget">
            <BudgetOptimization />
          </TabsContent>

          <TabsContent value="missions">
            <Card>
              <CardHeader>
                <CardTitle>Nhiệm Vụ</CardTitle>
                <CardDescription>Quản lý nhiệm vụ hàng ngày</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Danh sách nhiệm vụ sẽ được cập nhật</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
