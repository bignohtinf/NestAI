'use client';

import { Edit, Eye, MessageSquare, Plus, Trash2, Upload } from 'lucide-react';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    role: string;
  };
  action: 'created' | 'edited' | 'deleted' | 'commented' | 'uploaded' | 'viewed';
  target: string;
  timestamp: string;
  details?: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    user: { name: 'Nguyễn Thị Hương', role: 'Biên tập viên' },
    action: 'created',
    target: "Bài viết: 'Dinh dưỡng cho bé'",
    timestamp: '5 phút trước',
    details: 'Danh mục Sức khỏe',
  },
  {
    id: '2',
    user: { name: 'Trần Văn Minh', role: 'Quản trị' },
    action: 'edited',
    target: 'Sản phẩm Sữa NestAI Gold',
    timestamp: '15 phút trước',
    details: 'Cập nhật giá bán',
  },
  {
    id: '3',
    user: { name: 'Lê Thị Mai', role: 'Admin' },
    action: 'uploaded',
    target: 'banner-khuyen-mai-2026.jpg',
    timestamp: '1 giờ trước',
    details: 'File hình ảnh 2.4 MB',
  },
  {
    id: '4',
    user: { name: 'Phạm Đức Anh', role: 'Hỗ trợ' },
    action: 'commented',
    target: 'Đơn hàng #1234',
    timestamp: '2 giờ trước',
    details: 'Đã phản hồi khách hàng',
  },
  {
    id: '5',
    user: { name: 'Vũ Thanh Tùng', role: 'Biên tập viên' },
    action: 'deleted',
    target: 'Bản nháp: Tin tức cũ',
    timestamp: '3 giờ trước',
    details: 'Xóa nội dung lỗi thời',
  },
  {
    id: '6',
    user: { name: 'Hoàng Thị Lan', role: 'Khách hàng' },
    action: 'viewed',
    target: 'Trang sản phẩm',
    timestamp: '4 giờ trước',
    details: 'Cập nhật thống kê',
  },
];

const getActionIcon = (action: string) => {
  switch (action) {
    case 'created':
      return <Plus className="h-4 w-4" />;
    case 'edited':
      return <Edit className="h-4 w-4" />;
    case 'deleted':
      return <Trash2 className="h-4 w-4" />;
    case 'commented':
      return <MessageSquare className="h-4 w-4" />;
    case 'uploaded':
      return <Upload className="h-4 w-4" />;
    case 'viewed':
      return <Eye className="h-4 w-4" />;
    default:
      return <Edit className="h-4 w-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'created':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'edited':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'deleted':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'commented':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'uploaded':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'viewed':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'Biên tập viên':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Quản trị':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'Hỗ trợ':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'Khách hàng':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default function UserActivity() {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Hoạt động người dùng
        </h3>
        <button className="text-sm text-rose-500 hover:underline">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <div
              className={`p-2 rounded-full ${getActionColor(activity.action)} flex-shrink-0`}
            >
              {getActionIcon(activity.action)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {activity.user.name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.user.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full ${getRoleBadgeColor(activity.user.role)}`}
                  >
                    {activity.user.role}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {activity.timestamp}
                </span>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">
                  {activity.action === 'created'
                    ? 'Tạo'
                    : activity.action === 'edited'
                      ? 'Sửa'
                      : activity.action === 'deleted'
                        ? 'Xóa'
                        : activity.action === 'commented'
                          ? 'Bình luận'
                          : activity.action === 'uploaded'
                            ? 'Tải lên'
                            : 'Xem'}
                </span>{' '}
                {activity.target}
                {activity.details && (
                  <span className="text-xs"> &bull; {activity.details}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            24 người dùng hoạt động hôm nay
          </span>
          <button className="text-rose-500 hover:underline">
            Quản lý người dùng
          </button>
        </div>
      </div>
    </div>
  );
}
