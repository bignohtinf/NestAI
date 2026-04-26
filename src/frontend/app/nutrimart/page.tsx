'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { SmartShopping } from '@/components/metrics/smart-shopping';
import { IngredientScanner } from '@/components/metrics/ingredient-scanner';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NutrimartPage() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'shopping' | 'scanner'>('shopping');
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
    if (tab === 'scanner') {
      setActiveTab('scanner');
    } else {
      setActiveTab('shopping');
    }
  }, [searchParams, mounted]);

  if (!mounted || !user || user.role !== 'father') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">NutriMart</h1>
          <p className="text-muted-foreground">Mua sắm thông minh và quét thành phần</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'shopping' | 'scanner')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shopping">Mua Sắm</TabsTrigger>
            <TabsTrigger value="scanner">Quét</TabsTrigger>
          </TabsList>

          <TabsContent value="shopping">
            <SmartShopping />
          </TabsContent>

          <TabsContent value="scanner">
            <IngredientScanner />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
