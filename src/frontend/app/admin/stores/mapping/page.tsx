'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Search, Package, Globe, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function StoreMappingPage() {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMappings() {
      try {
        setLoading(true);
        // We'll use a generic search or specific mapping API if available
        // For now, let's mock some data or use the store mapping endpoint if implemented in backend
        // Backend has: GET /admin/stores/food-mappings
        const res = await adminApi.apiCall('/api/admin/stores/food-mappings');
        setMappings(res.items || []);
      } catch (err) {
        console.error('Failed to fetch mappings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMappings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LinkIcon className="h-8 w-8 text-indigo-500" />
            Liên kết Món ăn - Cửa hàng
          </h1>
          <p className="text-gray-500 mt-2">Quản lý thực phẩm có sẵn tại các hệ thống siêu thị</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">Liên kết nhanh</CardTitle>
            <CardDescription>Chọn món ăn và siêu thị để tạo liên kết</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn món ăn</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Tìm món ăn..." className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn siêu thị</label>
              <select className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 outline-none">
                <option>WinMart+</option>
                <option>Co.op Food</option>
                <option>Bách Hóa Xanh</option>
              </select>
            </div>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Tạo liên kết mới
            </button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">Món ăn đã liên kết</CardTitle>
            <CardDescription>Các món ăn đang khả dụng trên thị trường</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : mappings.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm italic">Chưa có liên kết nào</div>
              ) : (
                mappings.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{m.foodName}</div>
                        <div className="text-xs text-gray-500">{m.storeName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-green-600 font-bold">{m.priceVnd?.toLocaleString()}đ</span>
                       <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
