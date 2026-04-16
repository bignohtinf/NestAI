'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { SmartScan } from '@/components/metrics/smart-scan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SmartScanPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Smart Scan</h1>
          <p className="text-muted-foreground">Chụp ảnh món ăn để AI phân tích dinh dưỡng</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chụp ảnh & Tính calo</CardTitle>
            <CardDescription>Chụp ảnh món ăn để AI phân tích dinh dưỡng tự động</CardDescription>
          </CardHeader>
          <CardContent>
            <SmartScan />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
