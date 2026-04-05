import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Users, BarChart3, AlertCircle, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - NutriGrid',
  description: 'Bảng điều khiển quản trị',
};

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    redirect('/unauthorized');
  }

  const stats = [
    {
      label: 'Tổng Nhân Viên',
      value: '15',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Thực Đơn Hôm Nay',
      value: '3',
      icon: BarChart3,
      color: 'bg-green-500',
    },
    {
      label: 'Cảnh Báo Dị Ứng',
      value: '2',
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      label: 'Nguyên Liệu Tồn Kho',
      value: '142',
      icon: Package,
      color: 'bg-purple-500',
    },
  ];

  return (
    <MainLayout
      userRole={userRole}
      userName={session.user?.name || 'Admin'}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Chào mừng bạn quay trở lại, {session.user?.name}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-6 border-none shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-none shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Hoạt Động Gần Đây
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Cập nhật nhân viên', time: '2 giờ trước' },
                { action: 'Tạo thực đơn mới', time: '5 giờ trước' },
                { action: 'Nhập kho nguyên liệu', time: '1 ngày trước' },
              ].map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item.action}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Thống Kê Nhanh
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Nhân viên hoạt động', value: '14/15' },
                { label: 'Thực đơn tuần này', value: '21' },
                { label: 'Tỷ lệ hoàn thành', value: '94%' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.value}
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
