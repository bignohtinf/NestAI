'use client';

import { useEffect, useState } from 'react';
import { Eye, MessageSquare, MoreHorizontal, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiCall } from '@/lib/api';

interface CMSItem {
  id: string;
  type: string;
  title: string;
  status: 'published' | 'draft' | 'scheduled' | 'review';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  authorEmail?: string;
  slug?: string;
}

interface CMSItemListResponse {
  items: CMSItem[];
  total: number;
  limit: number;
  offset: number;
}

function formatPublishDate(item: CMSItem): string {
  if (item.status === 'draft') return 'Bản nháp';
  if (item.status === 'review') return 'Chờ duyệt';
  if (item.status === 'scheduled' && item.publishedAt) {
    const d = new Date(item.publishedAt);
    return `Lên lịch: ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
  }
  const dateStr = item.publishedAt || item.createdAt;
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffHour < 1) return 'Vừa đăng';
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function getAuthorInitials(email?: string): string {
  if (!email) return 'A';
  return email.charAt(0).toUpperCase();
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const statusLabels: Record<string, string> = {
  published: 'Đã đăng',
  draft: 'Nháp',
  scheduled: 'Lên lịch',
  review: 'Chờ duyệt',
};

export default function RecentPosts() {
  const [posts, setPosts] = useState<CMSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall<CMSItemListResponse>(
        '/api/admin/system/cms?type=post&limit=5&offset=0'
      );
      setPosts(data.items || []);
    } catch (err) {
      setError('Không thể tải danh sách bài viết');
      console.error('RecentPosts API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bài viết gần đây
        </h3>
        <button onClick={fetchPosts} className="text-sm text-rose-500 hover:underline">
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
          <button onClick={fetchPosts} className="ml-auto text-rose-500 hover:underline text-xs">
            Thử lại
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Chưa có bài viết nào.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {getAuthorInitials(post.authorEmail)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {post.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate max-w-[120px]">
                      {post.authorEmail || 'Admin'}
                    </span>
                    <span>&bull;</span>
                    <span>{formatPublishDate(post)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${statusColors[post.status] || statusColors.draft}`}>
                  {statusLabels[post.status] || post.status}
                </span>

                {post.status === 'published' && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{(post.viewCount || 0).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                )}

                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={fetchPosts}
            className="text-xs text-gray-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Làm mới
          </button>
        </div>
      )}
    </div>
  );
}
