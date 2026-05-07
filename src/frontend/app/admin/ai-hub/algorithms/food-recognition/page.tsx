'use client';

import { Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FoodRecognitionAlgoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Camera className="h-8 w-8" />
          Thuật toán nhận diện thực phẩm
        </h1>
        <p className="text-gray-500 mt-2">Cấu hình chi tiết thuật toán nhận diện thực phẩm từ hình ảnh</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Food Recognition Algorithm Configuration</CardTitle>
          <CardDescription>Thiết lập tham số và mô hình nhận diện</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Food recognition algorithm configuration details will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
