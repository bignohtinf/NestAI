'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import {
  X,
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
  icon?: any;
  roles: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  // Shared
  { href: '/', label: 'Trang chủ', roles: ['mother', 'father', 'admin'] },
  { href: '/baby-journey', label: 'Hành Trình Của Bé', roles: ['mother', 'father'] },
  { href: '/notifications', label: 'Thông báo', roles: ['mother', 'father'] },
  { href: '/nori', label: 'Nori', roles: ['mother', 'father'] },
  
  // Mother only
  {
    label: 'Dinh dưỡng',
    roles: ['mother'],
    children: [
      { 
        label: 'Quét Dinh Dưỡng', 
        roles: ['mother'],
        children: [
          { href: '/nutrition-scan?tab=scan', label: 'Smart Scan', roles: ['mother'] },
          { href: '/nutrition-scan?tab=recommendations', label: 'Gợi ý', roles: ['mother'] },
        ]
      },
      { href: '/nutrition', label: 'Khuyến Nghị', roles: ['mother'] },
    ],
  },
  {
    label: 'Sức khỏe',
    roles: ['mother'],
    children: [
      { 
        label: 'Theo Dõi Sức Khỏe', 
        roles: ['mother'],
        children: [
          { href: '/wellness?tab=trend', label: 'Xu hướng', roles: ['mother'] },
          { href: '/wellness?tab=impact', label: 'Ảnh hưởng', roles: ['mother'] },
        ]
      },
      { href: '/wellness?tab=checkup', label: 'Cập nhật Khám định kì', roles: ['mother'] },
    ],
  },
  
  // Father only - Grouped
  {
    label: 'NutriMart',
    roles: ['father'],
    children: [
      { href: '/nutrimart?tab=shopping', label: 'Mua Sắm', roles: ['father'] },
      { href: '/nutrimart?tab=cooking', label: 'Nấu Ăn', roles: ['father'] },
    ],
  },
  {
    label: 'Hỗ trợ',
    roles: ['father'],
    children: [
      { href: '/?tab=checklist', label: 'Checklist', roles: ['father'] },
      { href: '/?tab=family', label: 'Gia đình', roles: ['father'] },
    ],
  },
  {
    label: 'Planner',
    roles: ['father'],
    children: [
      { href: '/planner?tab=budget', label: 'Kế Hoạch', roles: ['father'] },
      { href: '/planner?tab=missions', label: 'Nhiệm Vụ', roles: ['father'] },
    ],
  },
  
  // Admin only
  { href: '/admin', label: 'Quản trị', roles: ['admin'] },
];

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  // Find the parent item based on current pathname
  const getActiveParent = () => {
    const filteredNavItems = navigationItems.filter(item => item.roles.includes(user?.role || ''));
    for (const item of filteredNavItems) {
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
  const filteredItems = navigationItems.filter(item => item.roles.includes(user?.role || ''));
  const childrenToShow = activeParent?.children?.filter(child => child.roles.includes(user?.role || '')) || [];

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
                  const isActive = child.href ? currentPath === childPath : false;
                  const hasSubChildren = child.children && child.children.length > 0;
                  const isHovered = hoveredItem === child.label;

                  if (hasSubChildren) {
                    return (
                      <div 
                        key={child.label}
                        onMouseEnter={() => setHoveredItem(child.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="px-3 py-2 text-sm font-medium text-sidebar-foreground cursor-pointer hover:text-safe-green rounded-lg transition-colors">
                          {child.label}
                        </div>
                        {isHovered && (
                          <div className="ml-4 space-y-1">
                            {child.children!.map((subChild) => {
                              const SubIcon = subChild.icon;
                              const subChildPath = subChild.href;
                              const isSubActive = pathname === subChildPath;

                              return (
                                <Link
                                  key={subChild.href}
                                  href={subChild.href!}
                                  className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isSubActive
                                      ? 'bg-[#f2f9ff] text-[#0075de]'
                                      : 'text-sidebar-foreground hover:text-safe-green'
                                  )}
                                  onClick={() => onOpenChange(false)}
                                >
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
                          ? 'bg-[#f2f9ff] text-[#0075de]'
                          : 'text-sidebar-foreground hover:text-safe-green'
                      )}
                      onClick={() => onOpenChange(false)}
                    >
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
              variant="secondary"
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
