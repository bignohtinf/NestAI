'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { SmartShopping } from '@/components/metrics/smart-shopping';
import { IngredientScanner } from '@/components/metrics/ingredient-scanner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function NutrimartPageInner() {
  const { ready, user } = useAuthGuard({ allowedRoles: ['father'] });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'shopping' | 'scanner'>('shopping');

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'scanner' ? 'scanner' : 'shopping');
  }, [searchParams]);

  if (!ready) return null;

  const handleTabChange = (value: string) => {
    const tab = value as 'shopping' | 'scanner';
    setActiveTab(tab);
    router.push('/nutrimart?tab=' + tab, { scroll: false });
  };

  return (
    <MainLayout fullWidth>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <span className="text-2xl">&#x1F6D2;</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">NutriMart</h1>
            <p className="text-muted-foreground">Ho tro bo di cho thong minh &mdash; quet thuc pham &amp; goi y mon an</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="shopping">Mua Sam</TabsTrigger>
            <TabsTrigger value="scanner">Quet</TabsTrigger>
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

export default function NutrimartPage() {
  return (
    <Suspense fallback={null}>
      <NutrimartPageInner />
    </Suspense>
  );
}
