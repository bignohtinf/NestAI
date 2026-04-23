'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NutritionRecommendations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Khuyến Nghị Dinh Dưỡng</CardTitle>
        <CardDescription>Gợi ý dinh dưỡng cá nhân hóa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Khuyến nghị dinh dưỡng sẽ được cập nhật</p>
        </div>
      </CardContent>
    </Card>
  );
}
