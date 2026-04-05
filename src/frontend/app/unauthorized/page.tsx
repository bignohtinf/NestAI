import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Truy cập bị từ chối
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là một lỗi.
        </p>

        <Button asChild>
          <Link href="/login">Quay lại trang đăng nhập</Link>
        </Button>
      </div>
    </div>
  );
}
