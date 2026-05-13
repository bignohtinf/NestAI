'use client';

import { Edit, Eye, MessageSquare, Plus, Trash2, Upload, RefreshCw, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, any>;
  success: boolean;
  createdAt: string;
  adminEmail?: string;
}

interface UserActivityProps {
  data?: { logs: AuditLog[]; total: number };
  onRefresh?: () => void;
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return 'Hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

type ActionCategory = 'created' | 'edited' | 'deleted' | 'commented' | 'uploaded' | 'viewed' | 'other';

function categorizeAction(action: string): ActionCategory {
  if (action.includes('create') || action.includes('add') || action.includes('register')) return 'created';
  if (action.includes('update') || action.includes('edit') || action.includes('modify')) return 'edited';
  if (action.includes('delete') || action.includes('remove')) return 'deleted';
  if (action.includes('comment') || action.includes('reply')) return 'commented';
  if (action.includes('upload') || action.includes('import')) return 'uploaded';
  if (action.includes('view') || action.includes('read') || action.includes('export')) return 'viewed';
  return 'other';
}

const actionIconMap: Record<ActionCategory, JSX.Element> = {
  created: <Plus className="h-4 w-4" />,
  edited: <Edit className="h-4 w-4" />,
  deleted: <Trash2 className="h-4 w-4" />,
  commented: <MessageSquare className="h-4 w-4" />,
  uploaded: <Upload className="h-4 w-4" />,
  viewed: <Eye className="h-4 w-4" />,
  other: <Edit className="h-4 w-4" />,
};

const actionColorMap: Record<ActionCategory, string> = {
  created: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  edited: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  deleted: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  commented: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  uploaded: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  viewed: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

const actionLabelMap: Record<ActionCategory, string> = {
  created: 'Tạo',
  edited: 'Sửa',
  deleted: 'Xoá',
  commented: 'Bình luận',
  uploaded: 'Tải lên',
  viewed: 'Xem',
  other: 'Thực hiện',
};

function getInitials(email: string): string {
  if (!email) return 'A';
  return email.charAt(0).toUpperCase();
}

function getTargetLabel(action: string, targetType?: string, details?: Record<string, any>): string {
  if (details?.title) return String(details.title);
  if (details?.name) return String(details.name);
  if (targetType) {
    const typeLabels: Record<string, string> = {
      post: 'bài viết',
      user: 'người dùng',
      store: 'cửa hàng',
      cms_item: 'nội dung',
      algorithm: 'thuật toán',
      rag_document: 'tài liệu',
      category: 'danh mục',
      settings: 'cài đặt',
    };
    return typeLabels[targetType] || targetType;
  }
  const parts = action.split('_');
  return parts.slice(1).join(' ') || action;
}

export default function UserActivity({ data, onRefresh }: UserActivityProps) {
  // Show max 6 logs to differentiate from SystemHistory (which shows 8)
  const logs = (data?.logs || []).slice(0, 6);
  const total = data?.total || 0;
  const loading = !data;

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Hoạt động người dùng
        </h3>
        <button onClick={onRefresh} className="text-sm text-rose-500 hover:underline">
          Xem tất cả
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Chưa có hoạt động nào được ghi nhận.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const category = categorizeAction(log.action);
            const displayEmail = log.adminEmail || log.adminId || 'Hệ thống';
            const initials = getInitials(displayEmail);
            const targetLabel = getTargetLabel(log.action, log.targetType, log.details);

            return (
              <div
                key={log.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <div className={`p-2 rounded-full ${actionColorMap[category]} flex-shrink-0`}>
                  {actionIconMap[category]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {initials}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                        {displayEmail}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span>{actionLabelMap[category]}</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">{targetLabel}</span>
                    {log.targetType && (
                      <span className="text-xs text-gray-400"> &bull; {log.targetType}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {total > 0 ? `${total} hành động được ghi nhận` : 'Không có dữ liệu'}
          </span>
          <button
            onClick={onRefresh}
            className="text-rose-500 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Làm mới
          </button>
        </div>
      </div>
    </div>
  );
}
