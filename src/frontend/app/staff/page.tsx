import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, AlertCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Staff Dashboard - NutriGrid',
  description: 'Bảng điều khiển nhân viên',
};

export default async function StaffDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'staff' && userRole !== 'admin') {
    redirect('/unauthorized');
  }

  const features = [
    {
      title: 'Lập Thực Đơn',
      description: 'Tạo và quản lý các thực đơn hàng ngày',
      icon: UtensilsCrossed,
      href: '/staff/menu',
      color: 'bg-green-500',
    },
    {
      title: 'Quản Lý Dị Ứng',
      description: 'Theo dõi và quản lý thông tin dị ứng của học sinh',
      icon: AlertCircle,
      href: '/staff/allergies',
      color: 'bg-orange-500',
    },
    {
      title: 'Kho Nguyên Liệu',
      description: 'Quản lý tồn kho nguyên liệu',
      icon: Package,
      href: '/staff/inventory',
      color: 'bg-purple-500',
    },
  ];

  return (
    <MainLayout
      userRole={userRole}
      userName={session.user?.name || 'Nhân Viên'}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Bảng Điều Khiển Nhân Viên
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Chào mừng, {session.user?.name}! Chọn một tính năng để bắt đầu.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
              >
                <Card className="border-none shadow-sm hover:shadow-lg transition-all h-full cursor-pointer overflow-hidden group">
                  <div className="p-6 flex flex-col h-full">
                    <div className="mb-4">
                      <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all gap-1 font-medium text-sm">
                      Truy Cập
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm p-6 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Hôm Nay
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Thực Đơn Cần Lập', value: '1' },
                { label: 'Cảnh Báo Dị Ứng', value: '0' },
                { label: 'Nguyên Liệu Hết', value: '0' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {item.label}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-sm p-6 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Những Việc Cần Làm
            </h3>
            <div className="space-y-2">
              {[
                { task: 'Kiểm tra nguyên liệu hôm nay' },
                { task: 'Cập nhật thông tin dị ứng' },
                { task: 'Tạo thực đơn ngày mai' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 py-2"
                >
                  <div className="w-4 h-4 rounded border-2 border-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
