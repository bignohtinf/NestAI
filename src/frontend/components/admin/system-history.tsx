'use client';

import { useEffect, useState } from 'react';
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
  Edit,
  Trash2,
  Plus,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { apiCall } from '@/lib/api';

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

interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
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

const getActionIcon = (action: string) => {
  if (action.includes('settings') || action.includes('config')) return <Save className="h-4 w-4" />;
  if (action.includes('create') || action.includes('add')) return <Plus className="h-4 w-4" />;
  if (action.includes('update') || action.includes('edit')) return <Edit className="h-4 w-4" />;
  if (action.includes('delete') || action.includes('remove')) return <Trash2 className="h-4 w-4" />;
  if (action.includes('backup') || action.includes('export')) return <Download className="h-4 w-4" />;
  if (action.includes('import') || action.includes('upload')) return <Upload className="h-4 w-4" />;
  if (action.includes('security') || action.includes('auth') || action.includes('login')) return <Shield className="h-4 w-4" />;
  if (action.includes('database') || action.includes('db') || action.includes('migrate')) return <Database className="h-4 w-4" />;
  if (action.includes('view') || action.includes('read')) return <Eye className="h-4 w-4" />;
  if (action.includes('plugin') || action.includes('integration')) return <Plug className="h-4 w-4" />;
  if (action.includes('theme') || action.includes('design')) return <Palette className="h-4 w-4" />;
  if (action.includes('disable') || action.includes('deactivate')) return <PowerOff className="h-4 w-4" />;
  if (action.includes('refresh') || action.includes('sync')) return <RefreshCw className="h-4 w-4" />;
  return <Settings className="h-4 w-4" />;
};

const getActionColor = (action: string) => {
  if (action.includes('settings') || action.includes('config')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
  if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
  if (action.includes('update') || action.includes('edit')) return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
  if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
  if (action.includes('backup') || action.includes('export')) return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
  if (action.includes('security') || action.includes('auth')) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
  if (action.includes('database') || action.includes('db')) return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
};

const formatActionLabel = (action: string, targetType?: string): string => {
  const labels: Record<string, string> = {
    create_user: 'Tạo người dùng',
    update_user: 'Cập nhật người dùng',
    delete_user: 'Xoá người dùng',
    create_post: 'Tạo bài viết',
    update_post: 'Cập nhật bài viết',
    delete_post: 'Xoá bài viết',
    create_store: 'Thêm cửa hàng',
    update_store: 'Cập nhật cửa hàng',
    delete_store: 'Xoá cửa hàng',
    update_settings: 'Cập nhật cài đặt',
    update_algorithm: 'Cập nhật thuật toán',
    create_rag: 'Thêm tài liệu RAG',
    delete_rag: 'Xoá tài liệu RAG',
    export_data: 'Xuất dữ liệu',
    import_data: 'Nhập dữ liệu',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
  };
  if (labels[action]) return labels[action];
  // Fallback: humanize the action string
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function SystemHistory() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall<AuditLogListResponse>('/api/admin/system/audit-logs?limit=8&offset=0');
      setLogs(data.logs || []);
      setLastChecked(formatRelativeTime(new Date().toISOString()));
    } catch (err) {
      setError('Không thể tải lịch sử hệ thống');
      console.error('SystemHistory API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Lịch sử hệ thống
        </h3>
        <button
          onClick={fetchLogs}
          className="text-sm text-rose-500 hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 py-6 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Chưa có sự kiện nào được ghi nhận.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <div className={`p-2 rounded-full ${getActionColor(log.action)} flex-shrink-0`}>
                {getActionIcon(log.action)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatActionLabel(log.action, log.targetType)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded-full ${
                        log.success
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {log.success ? 'success' : 'error'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  bởi{' '}
                  <span className="font-medium">
                    {log.adminEmail || log.adminId || 'Hệ thống'}
                  </span>
                  {log.targetType && (
                    <span className="text-xs"> &bull; {log.targetType}</span>
                  )}
                  {log.details && typeof log.details === 'object' && Object.keys(log.details).length > 0 && (
                    <span className="text-xs">
                      {' '}&bull; {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).slice(0, 1).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {lastChecked ? `Kiểm tra lần cuối: ${lastChecked}` : 'Đang tải...'}
          </span>
          <button
            onClick={fetchLogs}
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
