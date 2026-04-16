'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Camera,
  Heart,
  Settings,
  X,
  Bell,
  MessageCircle,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  href?: string;
  label: string;
  icon: any;
  roles: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  // Shared
  { href: '/', label: 'Trang chủ', icon: LayoutDashboard, roles: ['mother', 'father', 'admin'] },
  { href: '/baby-journey', label: 'Hành Trình Của Bé', icon: Heart, roles: ['mother', 'father'] },
  { href: '/notifications', label: 'Thông báo', icon: Bell, roles: ['mother', 'father'] },
  { href: '/nori', label: 'Nori', icon: MessageCircle, roles: ['mother', 'father'] },
  
  // Mother only
  {
    label: 'Dinh dưỡng',
    icon: Camera,
    roles: ['mother'],
    children: [
      { 
        label: 'Quét Dinh Dưỡng', 
        icon: Camera, 
        roles: ['mother'],
        children: [
          { href: '/nutrition-scan?tab=scan', label: 'Smart Scan', icon: Camera, roles: ['mother'] },
          { href: '/nutrition-scan?tab=recommendations', label: 'Gợi ý', icon: Camera, roles: ['mother'] },
        ]
      },
      { href: '/nutrition', label: 'Khuyến Nghị', icon: Camera, roles: ['mother'] },
    ],
  },
  {
    label: 'Sức khỏe',
    icon: Heart,
    roles: ['mother'],
    children: [
      { 
        label: 'Theo Dõi Sức Khỏe', 
        icon: Heart, 
        roles: ['mother'],
        children: [
          { href: '/wellness?tab=trend', label: 'Xu hướng', icon: Heart, roles: ['mother'] },
          { href: '/wellness?tab=impact', label: 'Ảnh hưởng', icon: Heart, roles: ['mother'] },
        ]
      },
      { href: '/wellness?tab=checkup', label: 'Cập nhật Khám định kì', icon: Heart, roles: ['mother'] },
    ],
  },
  
  // Father only - Grouped
  {
    label: 'NutriMart',
    icon: ShoppingCart,
    roles: ['father'],
    children: [
      { href: '/nutrimart?tab=shopping', label: 'Mua Sắm', icon: ShoppingCart, roles: ['father'] },
      { href: '/nutrimart?tab=cooking', label: 'Nấu Ăn', icon: ShoppingCart, roles: ['father'] },
    ],
  },
  {
    label: 'Hỗ trợ',
    icon: Heart,
    roles: ['father'],
    children: [
      { href: '/?tab=checklist', label: 'Checklist', icon: Heart, roles: ['father'] },
      { href: '/?tab=family', label: 'Gia đình', icon: Heart, roles: ['father'] },
    ],
  },
  {
    label: 'Planner',
    icon: Wallet,
    roles: ['father'],
    children: [
      { href: '/planner?tab=budget', label: 'Kế Hoạch', icon: Wallet, roles: ['father'] },
      { href: '/planner?tab=missions', label: 'Nhiệm Vụ', icon: Wallet, roles: ['father'] },
    ],
  },
  
  // Admin only
  { href: '/admin', label: 'Quản trị', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  // Find the parent item based on current pathname
  const getActiveParent = () => {
    for (const item of navigationItems) {
      if (item.children) {
        // Check level 1 children
        if (item.children.some(child => {
          const childPath = child.href?.split('?')[0];
          const currentPath = pathname.split('?')[0];
          return currentPath === childPath;
        })) {
          return item;
        }
        
        // Check level 2 children (sub-children)
        if (item.children.some(child => {
          if (child.children) {
            return child.children.some(subChild => {
              const subChildPath = subChild.href?.split('?')[0];
              const currentPath = pathname.split('?')[0];
              return currentPath === subChildPath;
            });
          }
          return false;
        })) {
          return item;
        }
      }
    }
    return null;
  };

  const activeParent = getActiveParent();
  const childrenToShow = activeParent?.children || [];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-1 px-3 py-4">
            {/* Show children of active parent */}
            {childrenToShow.length > 0 && (
              <>
                <div className="mb-4">
                  <p className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                    {activeParent?.label}
                  </p>
                </div>
                {childrenToShow.map((child) => {
                  const Icon = child.icon;
                  const childPath = child.href?.split('?')[0];
                  const currentPath = pathname.split('?')[0];
                  const isActive = currentPath === childPath;
                  const hasSubChildren = child.children && child.children.length > 0;
                  const isHovered = hoveredItem === child.label;

                  if (hasSubChildren) {
                    return (
                      <div 
                        key={child.label}
                        onMouseEnter={() => setHoveredItem(child.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="px-3 py-2 text-sm font-medium text-sidebar-foreground cursor-pointer hover:bg-sidebar-accent rounded-lg transition-colors">
                          <Icon className="h-4 w-4 inline mr-2" />
                          {child.label}
                        </div>
                        {isHovered && (
                          <div className="ml-4 space-y-1">
                            {child.children!.map((subChild) => {
                              const SubIcon = subChild.icon;
                              const subChildPath = subChild.href?.split('?')[0];
                              const isSubActive = currentPath === subChildPath;

                              return (
                                <Link
                                  key={subChild.href}
                                  href={subChild.href!}
                                  className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isSubActive
                                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                                  )}
                                  onClick={() => onOpenChange(false)}
                                >
                                  <SubIcon className="h-4 w-4 shrink-0" />
                                  <span>{subChild.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={child.href}
                      href={child.href!}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                      onClick={() => onOpenChange(false)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Close button for mobile */}
          <div className="border-t border-sidebar-border p-3 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Đóng
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
