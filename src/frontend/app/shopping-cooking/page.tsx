'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartShopping } from '@/components/metrics/smart-shopping';
import { IngredientScanner } from '@/components/metrics/ingredient-scanner';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ShoppingCookingPage() {
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
          <h1 className="text-3xl font-bold">Mua sắm & Nấu ăn</h1>
          <p className="text-muted-foreground">Tối ưu hóa mua sắm và gợi ý món ăn từ nguyên liệu</p>
        </div>

        <Tabs defaultValue="shopping" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shopping">
              <span className="hidden sm:inline">Mua sắm</span>
            </TabsTrigger>
            <TabsTrigger value="cooking">
              <span className="hidden sm:inline">Nấu ăn</span>
            </TabsTrigger>
          </TabsList>

          {/* Shopping Tab */}
          <TabsContent value="shopping" className="space-y-6">
            <SmartShopping />
          </TabsContent>

          {/* Cooking Tab */}
          <TabsContent value="cooking" className="space-y-6">
            <IngredientScanner />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
