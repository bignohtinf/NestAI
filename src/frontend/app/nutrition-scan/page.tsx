'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { SmartScan } from '@/components/metrics/smart-scan';
import { NutritionRecommendations } from '@/components/metrics/nutrition-recommendations';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NutritionScanPage() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'scan' | 'recommendations'>('scan');
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
    if (tab === 'recommendations') {
      setActiveTab('recommendations');
    } else {
      setActiveTab('scan');
    }
  }, [searchParams, mounted]);

  if (!mounted || !user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quét Dinh Dưỡng</h1>
          <p className="text-muted-foreground">Quét thực phẩm và nhận khuyến nghị dinh dưỡng</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scan' | 'recommendations')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Quét</TabsTrigger>
            <TabsTrigger value="recommendations">Khuyến Nghị</TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <SmartScan />
          </TabsContent>

          <TabsContent value="recommendations">
            <NutritionRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
