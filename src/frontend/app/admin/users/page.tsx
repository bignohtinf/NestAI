'use client';

import { Users2, Plus } from 'lucide-react';
import UsersTable from '@/components/admin/users-table';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users2 className="h-8 w-8 text-rose-500" />
            Quản lý người dùng
          </h1>
          <p className="text-gray-500 mt-2">Xem danh sách và quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg transition-shadow text-sm font-medium">
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </button>
      </div>

      {/* Users Table */}
      <UsersTable />
    </div>
  );
}
