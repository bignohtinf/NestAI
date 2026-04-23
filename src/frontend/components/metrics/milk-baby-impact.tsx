'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MilkBabyImpactProps {
  activeTab?: 'trend' | 'impact' | 'checkup';
}

export function MilkBabyImpact({ activeTab = 'trend' }: MilkBabyImpactProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {activeTab === 'trend' ? 'Xu hướng Sữa' : 'Ảnh hưởng Thực phẩm'}
        </CardTitle>
        <CardDescription>
          {activeTab === 'trend' 
            ? 'Theo dõi xu hướng sữa theo thời gian'
            : 'Xem ảnh hưởng của thực phẩm đến sữa'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Dữ liệu sẽ được cập nhật</p>
        </div>
      </CardContent>
    </Card>
  );
}
