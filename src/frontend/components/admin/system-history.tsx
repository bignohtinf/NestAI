'use client';

import {
  Settings,
  Palette,
  Plug,
  Shield,
  Database,
  Download,
  Upload,
  PowerOff,
  Save,
  RefreshCw,
} from 'lucide-react';

interface SystemEvent {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
  details?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const systemEvents: SystemEvent[] = [
  {
    id: '1',
    action: 'settings_saved',
    target: 'Cài đặt chung',
    user: 'Admin',
    timestamp: '10 phút trước',
    details: 'Cập nhật tiêu đề và mô tả',
    status: 'success',
  },
  {
    id: '2',
    action: 'product_updated',
    target: 'Sữa bột NestAI Premium',
    user: 'Nguyễn Văn A',
    timestamp: '25 phút trước',
    details: 'Cập nhật giá và mô tả',
    status: 'success',
  },
  {
    id: '3',
    action: 'order_processed',
    target: 'Đơn hàng #1247',
    user: 'Hệ thống',
    timestamp: '1 giờ trước',
    details: 'Xử lý thanh toán thành công',
    status: 'success',
  },
  {
    id: '4',
    action: 'backup_created',
    target: 'Sao lưu toàn bộ',
    user: 'Hệ thống',
    timestamp: '2 giờ trước',
    details: 'Sao lưu định kỳ - 2.4 GB',
    status: 'success',
  },
  {
    id: '5',
    action: 'user_registered',
    target: 'Người dùng mới',
    user: 'Trần Thị B',
    timestamp: '3 giờ trước',
    details: 'Đăng ký qua email',
    status: 'success',
  },
  {
    id: '6',
    action: 'security_scan',
    target: 'Kiểm tra bảo mật',
    user: 'Hệ thống',
    timestamp: '4 giờ trước',
    details: 'Không phát hiện mối đe dọa',
    status: 'success',
  },
  {
    id: '7',
    action: 'stock_warning',
    target: 'Cảnh báo kho hàng',
    user: 'Hệ thống',
    timestamp: '6 giờ trước',
    details: '5 sản phẩm sắp hết hàng',
    status: 'warning',
  },
  {
    id: '8',
    action: 'database_optimized',
    target: 'Tối ưu cơ sở dữ liệu',
    user: 'Hệ thống',
    timestamp: '8 giờ trước',
    details: 'Xóa 1,247 bản ghi cũ',
    status: 'success',
  },
];

const getActionIcon = (action: string) => {
  switch (action) {
    case 'settings_saved':
      return <Save className="h-4 w-4" />;
    case 'product_updated':
      return <Palette className="h-4 w-4" />;
    case 'order_processed':
      return <Plug className="h-4 w-4" />;
    case 'backup_created':
      return <Download className="h-4 w-4" />;
    case 'user_registered':
      return <Upload className="h-4 w-4" />;
    case 'security_scan':
      return <Shield className="h-4 w-4" />;
    case 'stock_warning':
      return <PowerOff className="h-4 w-4" />;
    case 'database_optimized':
      return <Database className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'settings_saved':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'product_updated':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'order_processed':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'backup_created':
      return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'user_registered':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'security_scan':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    case 'stock_warning':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'database_optimized':
      return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'info':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default function SystemHistory() {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Lịch sử hệ thống
        </h3>
        <button className="text-sm text-rose-500 hover:underline">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-3">
        {systemEvents.slice(0, 8).map((event) => (
          <div
            key={event.id}
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <div
              className={`p-2 rounded-full ${getActionColor(event.action)} flex-shrink-0`}
            >
              {getActionIcon(event.action)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.target}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(event.status)}`}
                  >
                    {event.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {event.timestamp}
                </span>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                bởi <span className="font-medium">{event.user}</span>
                {event.details && (
                  <span className="text-xs"> &bull; {event.details}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Kiểm tra lần cuối: 2 giờ trước
          </span>
          <button className="text-rose-500 hover:underline">
            Nhật ký hệ thống
          </button>
        </div>
      </div>
    </div>
  );
}
