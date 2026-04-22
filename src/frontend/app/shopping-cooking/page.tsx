'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartShopping } from '@/components/metrics/smart-shopping';
import { IngredientScanner } from '@/components/metrics/ingredient-scanner';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShoppingCookingPage() {
  const { user } = useApp();
  const router = useRouter();
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

  if (!mounted || !user || user.role !== 'father') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mua Sắm & Nấu Ăn</h1>
          <p className="text-muted-foreground">Quản lý mua sắm và nấu ăn cho gia đình</p>
        </div>

        <Tabs defaultValue="shopping" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shopping">Mua Sắm</TabsTrigger>
            <TabsTrigger value="cooking">Nấu Ăn</TabsTrigger>
          </TabsList>

          <TabsContent value="shopping">
            <SmartShopping />
          </TabsContent>

          <TabsContent value="cooking">
            <Card>
              <CardHeader>
                <CardTitle>Công Thức Nấu Ăn</CardTitle>
                <CardDescription>Công thức nấu ăn được khuyến nghị</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Công thức nấu ăn sẽ được cập nhật</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
