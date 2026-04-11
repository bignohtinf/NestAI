'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Apple,
  BarChart3,
  Camera,
  ClipboardList,
  Calculator,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Trang chủ',
    icon: <Home className="w-5 h-5" />,
  },
  {
    href: '/dashboard',
    label: 'Bảng điều khiển',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    href: '/profile',
    label: 'Hồ sơ của tôi',
    icon: <Apple className="w-5 h-5" />,
  },
  {
    href: '/photo-analysis',
    label: 'Phân tích ảnh',
    icon: <Camera className="w-5 h-5" />,
  },
  {
    href: '/menu-planner',
    label: 'Lập menu',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    href: '/nutrition-calc',
    label: 'Tính toán dinh dưỡng',
    icon: <Calculator className="w-5 h-5" />,
  },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 pt-20 md:pt-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex flex-col h-full px-4 py-4">
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden p-2"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
              >
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/20',
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="space-y-2 border-t border-sidebar-border pt-4">
            <Link href="/settings">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Cài đặt</span>
              </div>
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
