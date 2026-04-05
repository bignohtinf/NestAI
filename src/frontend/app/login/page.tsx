import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đăng Nhập - NutriGrid',
  description: 'Đăng nhập vào hệ thống quản lý dinh dưỡng học đường',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
             NutriGrid
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Hệ thống quản lý dinh dưỡng học đường
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white text-center">
            Đăng nhập tài khoản
          </h2>

          <LoginForm />

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Hệ thống quản lý được bảo vệ. Chỉ nhân viên được phép truy cập.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
