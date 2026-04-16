'use client';

import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/navigation/user-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

interface NavItem {
  href?: string;
  label: string;
  roles: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', roles: ['mother', 'father', 'admin'] },
  { href: '/baby-journey', label: 'Hành Trình Của Bé', roles: ['mother', 'father'] },
  { href: '/notifications', label: 'Thông báo', roles: ['mother', 'father'] },
  { href: '/nori', label: 'Nori', roles: ['mother', 'father'] },
  {
    label: 'Dinh dưỡng',
    roles: ['mother'],
    children: [
      { href: '/nutrition-scan', label: 'Quét Dinh Dưỡng', roles: ['mother'] },
      { href: '/nutrition', label: 'Khuyến Nghị', roles: ['mother'] },
    ],
  },
  {
    label: 'Sức khỏe',
    roles: ['mother'],
    children: [
      { href: '/wellness', label: 'Theo Dõi Sức Khỏe', roles: ['mother'] },
      { href: '/health', label: 'Sức Khỏe Chi Tiết', roles: ['mother'] },
    ],
  },
  {
    label: 'NutriMart',
    roles: ['father'],
    children: [
      { href: '/nutrimart', label: 'Mua Sắm', roles: ['father'] },
      { href: '/shopping-cooking', label: 'Nấu Ăn', roles: ['father'] },
    ],
  },
  {
    label: 'Planner',
    roles: ['father'],
    children: [
      { href: '/planner', label: 'Kế Hoạch', roles: ['father'] },
      { href: '/missions', label: 'Nhiệm Vụ', roles: ['father'] },
    ],
  },
  { href: '/admin', label: 'Quản trị', roles: ['admin'] },
];

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useApp();
  const pathname = usePathname();

  if (!user) return null;

  const filteredItems = navigationItems.filter((item) => item.roles.includes(user.role));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="flex items-center justify-between px-6 sm:px-8 py-1 gap-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-0 hover:opacity-80 transition-opacity shrink-0 ml-8 sm:ml-12">
          <Image 
            src="/img_0174.png" 
            alt="NextAi Logo" 
            width={40} 
            height={40}
            className="w-16 sm:w-20 object-contain -my-2"
          />
          <Image 
            src="/img_0175.png" 
            alt="NextAI text" 
            width={100} 
            height={100}
            className="w-24 sm:w-28 object-contain -my-3"
          />
          <h1 className="text-lg sm:text-xl font-bold text-primary hidden xs:inline">NextAI</h1>
        </Link>

        {/* Center: Navigation Items */}
        <nav className="hidden md:flex items-center gap-2 flex-1 justify-center px-8">
          {filteredItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              // For items with children, link to first child
              return (
                <Link
                  key={item.label}
                  href={item.children![0].href!}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                    isActive || item.children!.some(child => pathname === child.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: User info and logout */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.weeksPostpartum} tuần sau sinh
            </p>
          </div>

          {/* Show UserMenu for father and mother, LogOut button for admin */}
          {['father', 'mother'].includes(user.role) ? (
            <UserMenu />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Đăng xuất"
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
