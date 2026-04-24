'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { LogOut, Menu, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/navigation/user-menu';

interface HeaderProps {
  onMenuClick?: () => void;
}

interface NavItem {
  href?: string;
  label: string;
  roles: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', roles: ['mother', 'father', 'admin'] },
  {
    label: 'Dinh dưỡng',
    roles: ['mother'],
    children: [
      { href: '/nutrition-scan', label: 'Quét Dinh Dưỡng', roles: ['mother'] },
      { href: '/nutrition', label: 'Khuyến Nghị', roles: ['mother'] },
    ],
  },
  { href: '/nori', label: 'Nori AI', roles: ['mother', 'father'] },
  { href: '/baby-journey', label: 'Hành Trình Bé', roles: ['mother', 'father'] },
  {
    label: 'Sức khỏe',
    roles: ['mother'],
    children: [
      { href: '/wellness', label: 'Theo Dõi Sức Khỏe', roles: ['mother'] },
    ],
  },
  { href: '/notifications', label: 'Thông báo', roles: ['mother', 'father'] },
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
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    router.replace('/auth/login');
    router.refresh();
  };

  const filteredItems = user
    ? navigationItems.filter(item => item.roles.includes(user.role))
    : [];

  const getItemHref = (item: NavItem): string => {
    if (item.href) return item.href;
    if (item.children && item.children.length > 0) return item.children[0].href || '/';
    return '/';
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) return pathname === item.href;
    if (item.children) return item.children.some(child => pathname === child.href);
    return false;
  };

  // Skeleton before mount
  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 bg-[#fdf3f1]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-10 h-10 bg-muted rounded-xl" />
            <div className="w-20 h-8 bg-muted rounded" />
          </div>
          <div className="flex-1" />
          <div className="w-8 h-8 bg-muted rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-40 bg-[#fdf3f1] transition-all duration-500"
      style={{ padding: isScrolled ? '8px 12px' : '0' }}
    >
      <div className="flex items-center justify-between gap-3">

        {/* ── Nav pill — bo tròn khi scroll ── */}
        <div
          className={cn(
            'flex items-center gap-1 flex-1 min-w-0 transition-all duration-500',
            isScrolled
              ? 'bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl shadow-sm px-3 py-1.5'
              : 'px-4 sm:px-6 py-2'
          )}
        >
          {/* Hamburger mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden h-9 w-9 p-0 hover:bg-primary/10 shrink-0"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 hover:opacity-85 transition-opacity shrink-0"
          >
            <Image
              src="/img_0174.png"
              alt="NestAI Logo"
              width={40}
              height={40}
              className={cn(
                'object-contain -my-1 transition-all duration-500',
                isScrolled ? 'w-8 sm:w-9' : 'w-12 sm:w-14'
              )}
            />
            <Image
              src="/img_0175.png"
              alt="NestAI text"
              width={100}
              height={100}
              priority
              className={cn(
                'object-contain -my-2 transition-all duration-500',
                isScrolled ? 'w-16 sm:w-18' : 'w-20 sm:w-24'
              )}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {filteredItems.map(item => {
              const isActive = isItemActive(item);
              const href = getItemHref(item);
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover-coral'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile nav dropdown */}
          <div className="md:hidden flex-1 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="h-9 px-2 hover:bg-primary/10 gap-1"
            >
              <span className="text-sm font-medium">Menu</span>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', mobileNavOpen && 'rotate-180')}
              />
            </Button>

            {mobileNavOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border/60 rounded-xl shadow-lg z-50">
                <div className="py-2">
                  {filteredItems.map(item => {
                    const isActive = isItemActive(item);
                    const href = getItemHref(item);
                    return (
                      <Link
                        key={item.label}
                        href={href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          'block px-4 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground/70 hover:bg-muted'
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── User info — luôn ở ngoài pill ── */}
        <div
          className={cn(
            'flex items-center gap-2 sm:gap-3 shrink-0 transition-all duration-500',
            isScrolled ? 'pr-1' : 'px-4 sm:px-6 py-2'
          )}
        >
          {user && (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.babyStatus === 'pregnant' && user.gestationWeeks != null
                    ? `Tuần ${user.gestationWeeks} thai`
                    : user.babyStatus === 'born' && user.weeksPostpartum != null
                      ? `Tuần ${user.weeksPostpartum} sau sinh`
                      : user.role === 'admin'
                        ? '⚙️ Admin'
                        : ''}
                </p>
              </div>

              {['father', 'mother'].includes(user.role) ? (
                <UserMenu />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
}
