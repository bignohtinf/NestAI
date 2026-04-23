'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function BudgetOptimization() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tối Ưu Hóa Ngân Sách</CardTitle>
        <CardDescription>Gợi ý tiết kiệm chi phí</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tối ưu hóa ngân sách sẽ được cập nhật</p>
        </div>
      </CardContent>
    </Card>
  );
}
