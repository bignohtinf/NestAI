'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Loader2, Calendar, Activity, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function MedicalProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * pageSize;
        const data = await adminApi.getMedicalProfiles({
          limit: pageSize,
          offset: offset,
          search: searchTerm,
          pregnancyStatus: filterStatus === 'all' ? undefined : filterStatus
        });
        setProfiles(data.profiles);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch medical profiles:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      // Reset to page 1 when searching or filtering
      if (currentPage !== 1 && (searchTerm !== '' || filterStatus !== 'all')) {
        setCurrentPage(1);
      } else {
        fetchProfiles();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus, currentPage]);

  const totalPages = Math.ceil(total / pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pregnant':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 font-medium">Đang mang thai</span>;
      case 'postpartum':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-medium">Sau sinh</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 font-medium">Chưa có thai</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-rose-500" />
            Hồ sơ y tế & Thai kỳ
          </h1>
          <p className="text-gray-500 mt-2">Theo dõi và quản lý tình trạng sức khỏe thai kỳ của người dùng</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pregnant">Đang mang thai</option>
            <option value="postpartum">Sau sinh</option>
            <option value="not_pregnant">Chưa mang thai</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900">
            <Filter className="w-4 h-4" />
            Lọc nâng cao
          </button>
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
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Người dùng</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Giai đoạn</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Dự sinh</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Cân nặng / BMI</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {profiles.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 italic">
                      Không có dữ liệu hồ sơ y tế
                    </td>
                  </tr>
                ) : (
                  profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{p.userName}</div>
                        <div className="text-xs text-gray-500">{p.bloodType || 'N/A'} Rh{p.rhFactor || ''}</div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(p.pregnancyStatus)}</td>
                      <td className="px-4 py-4">
                        {p.pregnancyStatus === 'pregnant' ? (
                          <div>
                            <div className="font-medium">Tuần {p.weekOfPregnancy}</div>
                            <div className="text-xs text-gray-500">Tam cá nguyệt {p.trimester}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-4">
                        {p.dueDate ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(p.dueDate).toLocaleDateString('vi-VN')}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-rose-400" />
                          <span>{p.currentWeight || 'N/A'}kg</span>
                          <span className="text-xs text-gray-500">(BMI: {p.bmi || '?'})</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-lg transition-colors"
                          onClick={() => window.location.href = `/admin/users/${p.userId}`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">Trang {currentPage} / {totalPages || 1} — Hiển thị {profiles.length} / {total} hồ sơ</p>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded text-xs disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Trước
              </button>
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded text-xs bg-gray-50 dark:bg-gray-900 font-medium">
                {currentPage}
              </button>
              <button 
                className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded text-xs disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
              >
                Sau
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
