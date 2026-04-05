import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kho Nguyên Liệu - NutriGrid',
  description: 'Quản lý tồn kho nguyên liệu',
};

export default async function InventoryPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'admin' && userRole !== 'staff') {
    redirect('/unauthorized');
  }

  return (
    <MainLayout
      userRole={userRole}
      userName={session.user?.name || 'Nhân Viên'}
    >
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Kho Nguyên Liệu
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Quản lý tồn kho nguyên liệu
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm Nguyên Liệu
          </Button>
        </div>

        <Card className="border-none shadow-sm p-8 text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Kho trống
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Nhấn nút "Thêm Nguyên Liệu" để bắt đầu quản lý kho hàng.
            </p>
            <Button>Thêm Nguyên Liệu</Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
