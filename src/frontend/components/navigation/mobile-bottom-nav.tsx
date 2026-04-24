'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import { Home, Utensils, MessageCircle, User, Baby } from 'lucide-react';

interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const MOTHER_NAV: BottomNavItem[] = [
  { href: '/', label: 'Trang chủ', icon: Home, roles: ['mother'] },
  { href: '/nutrition-scan?tab=recommendations', label: 'Thực đơn', icon: Utensils, roles: ['mother'] },
  { href: '/nori', label: 'Nori AI', icon: MessageCircle, roles: ['mother'] },
  { href: '/baby-journey', label: 'Hành trình', icon: Baby, roles: ['mother'] },
  { href: '/profile', label: 'Hồ sơ', icon: User, roles: ['mother'] },
];

const FATHER_NAV: BottomNavItem[] = [
  { href: '/', label: 'Trang chủ', icon: Home, roles: ['father'] },
  { href: '/nutrimart', label: 'NutriMart', icon: Utensils, roles: ['father'] },
  { href: '/nori', label: 'Nori AI', icon: MessageCircle, roles: ['father'] },
  { href: '/baby-journey', label: 'Hành trình', icon: Baby, roles: ['father'] },
  { href: '/profile', label: 'Hồ sơ', icon: User, roles: ['father'] },
];

export function MobileBottomNav() {
  const { user } = useApp();
  const pathname = usePathname();

  if (!user || user.role === 'admin') return null;

  const navItems = user.role === 'mother' ? MOTHER_NAV : FATHER_NAV;

  const isActive = (href: string) => {
    const path = href.split('?')[0];
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border/60 safe-area-pb">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform',
                  active && 'scale-110'
                )}
              />
              <span className={cn('text-[10px] font-medium leading-tight', active && 'font-semibold')}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
