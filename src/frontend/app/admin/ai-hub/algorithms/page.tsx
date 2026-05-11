'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Camera, Zap, Settings2, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function AlgorithmsPage() {
  const router = useRouter();
  const [algos, setAlgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlgos() {
      try {
        setLoading(true);
        const data = await adminApi.getAlgorithms();
        setAlgos(data);
      } catch (err) {
        console.error('Failed to fetch algorithms:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlgos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            Trung tâm AI - Thuật toán
          </h1>
          <p className="text-gray-500 mt-2">Quản lý phiên bản và tham số tối ưu hóa mô hình</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {algos.map((algo) => (
          <Card key={algo.id} className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                  {algo.algorithmType === 'menu_recommendation' ? <Target className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-bold ${
                  algo.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {algo.status === 'active' ? 'Đang chạy' : 'Lưu trữ'}
                </span>
              </div>
              <CardTitle className="mt-4 text-lg">{algo.name}</CardTitle>
              <CardDescription className="text-xs">v{algo.currentVersion} • Cập nhật: {new Date(algo.lastUpdated).toLocaleDateString('vi-VN')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {algo.description || 'Không có mô tả cho phiên bản này.'}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Độ chính xác: {algo.accuracy != null ? `${(algo.accuracy * 100).toFixed(1)}%` : 'N/A'}
                </span>
                <button
                  onClick={() => router.push(`/admin/ai-hub/algorithms/${algo.algorithmType === 'menu_recommendation' ? 'menu-recommendation' : 'food-recognition'}`)}
                  className="text-xs font-medium text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Settings2 className="w-3 h-3" />
                  Cấu hình
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add new card placeholder */}
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-6 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group cursor-pointer">
          <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-rose-500 group-hover:border-rose-500 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="mt-4 text-sm font-medium text-gray-500 group-hover:text-rose-500 transition-colors">Thêm phiên bản mới</span>
        </Card>
      </div>
    </div>
  );
}
