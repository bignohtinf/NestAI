'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionChecklist } from '@/components/metrics/action-checklist';
import { FamilyStatus } from '@/components/metrics/family-status';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SupportPage() {
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
          <h1 className="text-3xl font-bold">Hỗ trợ</h1>
          <p className="text-muted-foreground">Checklist hôm nay và radar gia đình</p>
        </div>

        <Tabs defaultValue="checklist" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checklist">
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="family">
              <span className="hidden sm:inline">Gia đình</span>
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <ActionChecklist />
          </TabsContent>

          {/* Family Status Tab */}
          <TabsContent value="family" className="space-y-6">
            <FamilyStatus />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
