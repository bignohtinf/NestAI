'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import { apiCall } from '@/lib/api';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

interface CMSItemListResponse {
  items: any[];
  total: number;
  limit: number;
  offset: number;
}

// Assign a consistent color per category based on index
const CATEGORY_COLORS = [
  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
];

function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export default function ContentCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories and total post count in parallel
      const [cats, cms] = await Promise.all([
        apiCall<BlogCategory[]>('/api/admin/blog/categories'),
        apiCall<CMSItemListResponse>('/api/admin/system/cms?type=post&limit=1&offset=0').catch(() => ({ total: 0 })),
      ]);

      setCategories(Array.isArray(cats) ? cats : []);
      setTotalPosts((cms as CMSItemListResponse).total || 0);
    } catch (err) {
      setError('Không thể tải danh mục nội dung');
      console.error('ContentCategories API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Danh mục nội dung
        </h3>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Làm mới"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
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
          <button onClick={fetchData} className="ml-auto text-rose-500 hover:underline text-xs">
            Thử lại
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8">
          <Tag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Chưa có danh mục nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(index)} flex-shrink-0`}
                >
                  {category.name}
                </span>
                <div className="min-w-0 flex-1">
                  {category.description ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {category.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate italic">
                      /{category.slug}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {loading ? 'Đang tải...' : `${categories.length} danh mục`}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {totalPosts > 0 ? `${totalPosts} bài viết` : '—'}
          </span>
        </div>

        {!loading && !error && (
          <button
            onClick={fetchData}
            className="mt-2 w-full text-xs text-gray-400 hover:text-rose-500 flex items-center justify-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Làm mới
          </button>
        )}
      </div>
    </div>
  );
}
