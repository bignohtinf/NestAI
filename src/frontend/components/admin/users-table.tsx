'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Search, Shield, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastLogin = (date: string | null) => {
    if (!date) return 'Chưa đăng nhập';
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return 'Không xác định';
    }
  };

  return (
    <Card className="border-none shadow-sm">
      {/* Search Bar */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo email hoặc tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Nhân Viên
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Email
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Quyền
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Trạng Thái
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Lần Đăng Nhập Gần Nhất
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Hành Động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className="gap-1"
                    >
                      {user.role === 'admin' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {user.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? 'outline' : 'destructive'}
                    >
                      {user.is_active ? 'Hoạt Động' : 'Vô Hiệu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                    {formatLastLogin(user.last_login)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    Không tìm thấy nhân viên nào
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Stats */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Hiển thị {filteredUsers.length} / {users.length} nhân viên
        </p>
        <div className="flex gap-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
            {users.filter((u) => u.role === 'admin').length} Quản Trị
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
            {users.filter((u) => u.role === 'staff').length} Nhân Viên
          </span>
        </div>
      </div>
    </Card>
  );
}
