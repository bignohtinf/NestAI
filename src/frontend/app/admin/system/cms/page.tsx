'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Loader2, MoreVertical, Send, Eye, Edit2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function CMSPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchCMS() {
      try {
        setLoading(true);
        const data = await adminApi.getCMSItems({
          limit: 20,
          search: searchTerm
        });
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch CMS items:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchCMS, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'article':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-medium">Bài viết</span>;
      case 'notification':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 font-medium">Thông báo</span>;
      case 'broadcast':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 font-medium">Broadcast</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 font-medium">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-rose-500" />
            Bài viết & Thông báo
          </h1>
          <p className="text-gray-500 mt-2">Quản lý nội dung và truyền thông tới người dùng</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          Tạo nội dung mới
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Loại</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Ngày tạo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Tác giả</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {items.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 italic">
                      Chưa có nội dung nào được tạo
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 dark:text-white max-w-xs truncate">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.slug || ''}</div>
                      </td>
                      <td className="px-4 py-4">{getTypeBadge(item.type)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          item.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {item.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.authorName || 'Admin'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
