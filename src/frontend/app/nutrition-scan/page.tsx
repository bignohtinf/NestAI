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
  const [activeTab, setActiveTab] = useState<'scan' | 'recommendations'>('scan');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'recommendations') {
      setActiveTab('recommendations');
    } else {
      setActiveTab('scan');
    }
  }, [searchParams]);

  if (!user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quét Dinh Dưỡng</h1>
          <p className="text-muted-foreground">Chụp ảnh và nhận khuyến nghị dinh dưỡng</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scan' | 'recommendations')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">
              <span className="hidden sm:inline">Chụp ảnh</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <span className="hidden sm:inline">Khuyến nghị</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh & Tính calo</CardTitle>
                <CardDescription>Chụp ảnh món ăn để AI phân tích dinh dưỡng</CardDescription>
              </CardHeader>
              <CardContent>
                <SmartScan />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <NutritionRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
