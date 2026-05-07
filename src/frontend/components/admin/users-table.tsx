'use client';

import {
  Search,
  MoreHorizontal,
  Eye,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string | null;
}

const roleColors: Record<string, string> = {
  'mother': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  'father': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const roleLabels: Record<string, string> = {
  'mother': 'Mẹ bỉm sữa',
  'father': 'Ba bỉm sữa',
  'admin': 'Quản trị viên',
};

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, new: 0, inactive: 0 });
  const pageSize = 20;

  async function fetchUsers() {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const data = await adminApi.getUsers({ 
        limit: pageSize, 
        offset: offset,
        search: searchTerm 
      });
      setUsers(data.users);
      setTotal(data.total);
      
      // Also fetch overall stats for the counters
      const globalStats = await adminApi.getStats();
      setStats({
        total: globalStats.totalUsers,
        active: globalStats.activeUsers,
        new: 15, // Mock or get from specific analytics
        inactive: globalStats.totalUsers - globalStats.activeUsers
      });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to page 1 when searching
      if (currentPage !== 1 && searchTerm !== '') {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.total.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Tổng người dùng</p>
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.active.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Đang hoạt động</p>
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <UserPlus className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.new}</div>
          <p className="text-xs text-gray-500">Mới tuần này</p>
        </div>
        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <UserX className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.inactive.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Không hoạt động</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Vai trò</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tham gia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Đăng nhập cuối</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 italic">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-[10px] font-mono flex-shrink-0 border border-gray-200 dark:border-gray-700">
                          ID
                        </div>
                        <div>
                          <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{user.id}</p>
                          <p className="text-[10px] text-gray-400 uppercase">Mã định danh hệ thống</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => window.location.href = `/admin/users/${user.id}`}
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages || 1} — Hiển thị {users.length} / {total} người dùng
          </p>
          <div className="flex items-center space-x-2">
            <button 
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Trước
            </button>
            <div className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded-lg">
              {currentPage}
            </div>
            <button 
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0 || loading}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
