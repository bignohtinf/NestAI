'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Camera,
  Heart,
  Activity,
  Settings,
  Bell,
  MessageCircle,
  ShoppingCart,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

export function HeaderNav() {
  const pathname = usePathname();
  const { user } = useApp();

  if (!user) return null;

  // Shared navigation
  const sharedNav: NavItem[] = [
    { href: '/', label: 'Trang chủ', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/baby-journey', label: 'Hành Trình Của Bé', icon: <Heart className="h-4 w-4" /> },
    { href: '/notifications', label: 'Thông báo', icon: <Bell className="h-4 w-4" /> },
    { href: '/nori', label: 'Nori', icon: <MessageCircle className="h-4 w-4" /> },
  ];

  // Mother navigation
  const motherNav: NavGroup[] = [
    {
      label: 'Dinh dưỡng',
      icon: <Camera className="h-4 w-4" />,
      items: [
        { href: '/nutrition-scan', label: 'Smart Scan', icon: <Camera className="h-4 w-4" /> },
        { href: '/nutrition-scan?tab=recommendations', label: 'Gợi ý', icon: <Activity className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Sức khỏe',
      icon: <Heart className="h-4 w-4" />,
      items: [
        { href: '/wellness?tab=milk-baby', label: 'Sữa & Bé', icon: <Heart className="h-4 w-4" /> },
        { href: '/wellness?tab=health', label: 'Sức khỏe', icon: <Activity className="h-4 w-4" /> },
      ],
    },
  ];

  // Father navigation
  const fatherNav: NavGroup[] = [
    {
      label: 'NutriMart',
      icon: <ShoppingCart className="h-4 w-4" />,
      items: [
        { href: '/nutrimart?tab=shopping', label: 'Mua sắm', icon: <ShoppingCart className="h-4 w-4" /> },
        { href: '/nutrimart?tab=cooking', label: 'Nấu ăn', icon: <Camera className="h-4 w-4" /> },
      ],
    },
  ];

  // Father direct link to Planner (without dropdown)
  const fatherDirectLinks: NavItem[] = [
    { href: '/planner', label: 'Planner', icon: <Wallet className="h-4 w-4" /> },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="flex items-center gap-1 md:gap-2">
      {/* Shared items */}
      {sharedNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive(item.href)
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent'
          )}
        >
          {item.icon}
          <span className="hidden sm:inline">{item.label}</span>
        </Link>
      ))}

      {/* Mother-specific navigation */}
      {user.role === 'mother' && (
        <>
          {motherNav.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    group.items.some((item) => isActive(item.href))
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  {group.icon}
                  <span className="hidden sm:inline">{group.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {group.items.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </>
      )}

      {/* Father-specific navigation */}
      {user.role === 'father' && (
        <>
          {fatherNav.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    group.items.some((item) => isActive(item.href))
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  {group.icon}
                  <span className="hidden sm:inline">{group.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {group.items.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          {fatherDirectLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              )}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </>
      )}

      {/* Admin navigation */}
      {user.role === 'admin' && (
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive('/admin')
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent'
          )}
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Quản trị</span>
        </Link>
      )}
    </nav>
  );
}
