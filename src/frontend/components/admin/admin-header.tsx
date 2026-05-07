'use client';

import { Menu, Search, Bell, Settings, User, ChevronDown, Home, Sun, Moon, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useApp } from '@/lib/context';
import type { MenuState } from './admin-sidebar';

interface AdminHeaderProps {
  menuState: MenuState;
  onToggleMenu: () => void;
  onToggleMobileMenu: () => void;
}

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Bảng điều khiển',
  '/admin/users': 'Người dùng',
  '/admin/analytics': 'Thống kê',
  '/admin/products': 'Sản phẩm',
  '/admin/orders': 'Đơn hàng',
  '/admin/support': 'Hỗ trợ',
  '/admin/content': 'Nội dung',
  '/admin/security': 'An ninh',
  '/admin/settings': 'Cài đặt',
};

export default function AdminHeader({
  menuState,
  onToggleMenu,
  onToggleMobileMenu,
}: AdminHeaderProps) {
  const { user, logout } = useApp();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return null;
    const currentPage = breadcrumbMap[pathname] || segments[segments.length - 1];
    return currentPage;
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex items-center justify-between h-full px-4 lg:px-6">
      {/* Left side - Menu toggle and Breadcrumbs */}
      <div className="flex items-center space-x-4">
        {/* Desktop Menu Toggle */}
        <button
          onClick={onToggleMenu}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Menu"
        >
          <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Mobile Menu"
        >
          <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Link
            href="/admin"
            className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="h-4 w-4 mr-1" />
            Admin
          </Link>
          {getBreadcrumb() && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {getBreadcrumb()}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Center - Search (hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right side - Actions and Profile */}
      <div className="flex items-center space-x-2">
        {/* Mobile Search */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full" />
        </button>

        {/* Settings */}
        <Link
          href="/admin/settings"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'Admin'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Quản trị viên
              </span>
            </div>
            <ChevronDown className="hidden lg:block h-4 w-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'admin@nestai.com'}
                </p>
              </div>
              <button className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                <User className="w-4 h-4" />
                Hồ sơ của tôi
              </button>
              <Link
                href="/admin/settings"
                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Cài đặt
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
