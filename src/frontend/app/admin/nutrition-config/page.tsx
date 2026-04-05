import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cấu Hình Dinh Dưỡng - NutriGrid',
  description: 'Cấu hình tiêu chuẩn dinh dưỡng',
};

export default async function NutritionConfigPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    redirect('/unauthorized');
  }

  const nutritionStandards = [
    { label: 'Calo (kcal)', value: '2000', unit: 'kcal/ngày' },
    { label: 'Protein (g)', value: '65', unit: 'g/ngày' },
    { label: 'Carbohydrate (g)', value: '300', unit: 'g/ngày' },
    { label: 'Fat (g)', value: '55', unit: 'g/ngày' },
    { label: 'Fiber (g)', value: '25', unit: 'g/ngày' },
    { label: 'Calcium (mg)', value: '1000', unit: 'mg/ngày' },
  ];

  return (
    <MainLayout
      userRole={userRole}
      userName={session.user?.name || 'Admin'}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Cấu Hình Tiêu Chuẩn Dinh Dưỡng
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Thiết lập định mức dinh dưỡng chuẩn cho trường
          </p>
        </div>

        <Card className="border-none shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nutritionStandards.map((standard) => (
              <div key={standard.label} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {standard.label}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    defaultValue={standard.value}
                    className="flex-1"
                    placeholder="0"
                  />
                  <div className="flex items-center px-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                    {standard.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button size="lg" className="gap-2">
              <Save className="w-4 h-4" />
              Lưu Cấu Hình
            </Button>
          </div>
        </Card>

        {/* Information */}
        <Card className="mt-8 border-none shadow-sm p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Thông Tin
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Những giá trị này sẽ được sử dụng để tính toán và đánh giá chất lượng các thực đơn do nhân viên lập.
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
