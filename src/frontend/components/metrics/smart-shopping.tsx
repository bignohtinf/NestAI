'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SmartShopping() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mua Sắm Thông Minh</CardTitle>
        <CardDescription>Gợi ý mua sắm dựa trên nhu cầu dinh dưỡng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Danh sách mua sắm sẽ được cập nhật</p>
        </div>
      </CardContent>
    </Card>
  );
}
