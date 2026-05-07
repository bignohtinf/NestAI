'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Search, MapPin, Phone, ExternalLink, Loader2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        const data = await adminApi.getStores({
          limit: 20,
          search: searchTerm
        });
        setStores(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch stores:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-500" />
            Danh sách cửa hàng/Siêu thị
          </h1>
          <p className="text-gray-500 mt-2">Quản lý mạng lưới đối tác cung cấp thực phẩm</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-shadow text-sm font-medium">
          <Plus className="w-4 h-4" />
          Thêm đối tác
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Đối tác</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Loại</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Liên hệ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Thực phẩm</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {(!stores || stores.length === 0) && !loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 italic">
                      Chưa có đối tác nào trong danh sách
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {store.logoUrl ? (
                            <img src={store.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                              {store.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{store.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {store.address?.substring(0, 30)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase">
                          {store.type === 'supermarket' ? 'Siêu thị' : 'Cửa hàng'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <Phone className="w-3 h-3" />
                            {store.phone || 'N/A'}
                          </div>
                          {store.website && (
                            <a href={store.website} target="_blank" className="flex items-center gap-1.5 text-blue-500 hover:underline">
                              <ExternalLink className="w-3 h-3" />
                              Website
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          store.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {store.isActive ? 'Đang hợp tác' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs font-medium text-gray-900 dark:text-white">
                          {store.foodCount || 0} món
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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
