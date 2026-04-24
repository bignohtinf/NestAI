'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartScan } from '@/components/metrics/smart-scan';
import { NutritionRecommendations } from '@/components/metrics/nutrition-recommendations';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NutritionScanPage() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'scan' | 'recommendations'>('recommendations');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'scan') {
      setActiveTab('scan');
    } else {
      setActiveTab('recommendations');
    }
  }, [searchParams]);

  if (!user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Thực đơn & Dinh dưỡng</h1>
          <p className="text-muted-foreground">AI sinh thực đơn món Việt cá nhân hóa theo tuần thai và bệnh lý</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scan' | 'recommendations')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">
              <span className="hidden sm:inline">✨ Sinh thực đơn AI</span>
              <span className="sm:hidden">Thực đơn</span>
            </TabsTrigger>
            <TabsTrigger value="scan">
              <span className="hidden sm:inline">📷 Quét ảnh bữa ăn</span>
              <span className="sm:hidden">Quét ảnh</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <NutritionRecommendations />
          </TabsContent>

          <TabsContent value="scan">
            <SmartScan />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
