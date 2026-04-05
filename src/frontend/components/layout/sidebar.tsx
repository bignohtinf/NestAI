'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { BookOpen, LogOut } from 'lucide-react';
import { getAvailableNavItems } from '@/lib/navigation';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  userRole: string;
  userName: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getAvailableNavItems(userRole);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white w-64 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <div className="p-2 bg-blue-600 rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg">NutriGrid</h1>
          <p className="text-xs text-slate-400">v1.0</p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <p className="text-sm font-medium text-slate-100">{userName}</p>
        <p className="text-xs text-slate-400 mt-1">
          {userRole === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2 text-slate-300 border-slate-700 hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
