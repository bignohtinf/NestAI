'use client';

import { ShoppingCart, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FoodDatabasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý thực phẩm</h1>
        <p className="text-gray-500 mt-2">Quản lý cơ sở dữ liệu thực phẩm và dinh dưỡng</p>
      </div>

      <Tabs defaultValue="dishes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dishes" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Dishes
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Ingredients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dishes">
          <Card>
            <CardHeader>
              <CardTitle>Danh mục món ăn & Dinh dưỡng</CardTitle>
              <CardDescription>Quản lý tất cả các món ăn và thông tin dinh dưỡng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Dishes database will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients">
          <Card>
            <CardHeader>
              <CardTitle>Nguyên liệu gốc</CardTitle>
              <CardDescription>Quản lý danh sách nguyên liệu cơ bản</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Ingredients database will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
