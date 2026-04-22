'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function IngredientScanner() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quét Thành phần</CardTitle>
        <CardDescription>Quét và phân tích thành phần thực phẩm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tính năng quét thành phần sẽ được cập nhật</p>
        </div>
      </CardContent>
    </Card>
  );
}
