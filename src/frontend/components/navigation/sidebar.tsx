'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  X,
  Home,
  Baby,
  Bell,
  Sparkles,
  Camera,
  Apple,
  HeartPulse,
  ShoppingCart,
  ChefHat,
  CalendarDays,
  Trophy,
  Users,
  CheckSquare,
  Settings,
  TrendingUp,
  Stethoscope,
  ClipboardList,
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
  icon?: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', icon: Home, roles: ['mother', 'father', 'admin'] },
  { href: '/baby-journey', label: 'Hành Trình Của Bé', icon: Baby, roles: ['mother', 'father'] },
  { href: '/notifications', label: 'Thông báo', icon: Bell, roles: ['mother', 'father'] },
  { href: '/nori', label: 'Nori AI', icon: Sparkles, roles: ['mother', 'father'] },

  // Mother only
  {
    label: 'Dinh dưỡng',
    icon: Apple,
    roles: ['mother'],
    children: [
      {
        label: 'Quét Dinh Dưỡng',
        icon: Camera,
        roles: ['mother'],
        children: [
          { href: '/nutrition-scan?tab=scan', label: 'Smart Scan', icon: Camera, roles: ['mother'] },
          { href: '/nutrition-scan?tab=recommendations', label: 'Gợi ý', icon: ClipboardList, roles: ['mother'] },
        ],
      },
      { href: '/nutrition', label: 'Khuyến Nghị', icon: Apple, roles: ['mother'] },
    ],
  },
  
  { href: '/nori', label: 'Nori', roles: ['mother', 'father'] },
  { href: '/baby-journey', label: 'Hành Trình Của Bé', roles: ['mother', 'father'] },
  
  // Mother - Health
  {
    label: 'Sức khỏe',
    icon: HeartPulse,
    roles: ['mother'],
    children: [
      {
        label: 'Theo Dõi Sức Khỏe',
        icon: TrendingUp,
        roles: ['mother'],
        children: [
          { href: '/wellness?tab=trend', label: 'Xu hướng', icon: TrendingUp, roles: ['mother'] },
          { href: '/wellness?tab=impact', label: 'Ảnh hưởng', icon: HeartPulse, roles: ['mother'] },
        ],
      },
      { href: '/wellness?tab=checkup', label: 'Khám định kì', icon: Stethoscope, roles: ['mother'] },
    ],
  },

  // Father only
  {
    label: 'NutriMart',
    icon: ShoppingCart,
    roles: ['father'],
    children: [
      { href: '/nutrimart?tab=shopping', label: 'Mua Sắm', icon: ShoppingCart, roles: ['father'] },
      { href: '/nutrimart?tab=cooking', label: 'Nấu Ăn', icon: ChefHat, roles: ['father'] },
    ],
  },
  {
    label: 'Hỗ trợ',
    icon: Users,
    roles: ['father'],
    children: [
      { href: '/?tab=checklist', label: 'Checklist', icon: CheckSquare, roles: ['father'] },
      { href: '/?tab=family', label: 'Gia đình', icon: Users, roles: ['father'] },
    ],
  },
  {
    label: 'Planner',
    icon: CalendarDays,
    roles: ['father'],
    children: [
      { href: '/planner?tab=budget', label: 'Kế Hoạch', icon: CalendarDays, roles: ['father'] },
      { href: '/planner?tab=missions', label: 'Nhiệm Vụ', icon: Trophy, roles: ['father'] },
    ],
  },

  // Admin only
  { href: '/admin', label: 'Quản trị', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const { user } = useApp();
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to check if a href matches current location
  const isHrefActive = (href?: string): boolean => {
    if (!href) return false;
    const [hrefPath, hrefQuery] = href.split('?');
    const hrefTab = new URLSearchParams(hrefQuery).get('tab');
    
    const pathMatch = pathname === hrefPath;
    const tabMatch = hrefTab ? currentTab === hrefTab : !currentTab;
    return pathMatch && tabMatch;
  };

  // Helper function to check if any child is active
  const hasActiveChild = (children?: NavItem[]): boolean => {
    return children?.some(child => isHrefActive(child.href)) ?? false;
  };

  const getActiveParent = () => {
    const filteredNavItems = navigationItems.filter(item => item.roles.includes(user?.role || ''));
    for (const item of filteredNavItems) {
      if (item.children) {
        if (item.children.some(child => {
          const childPath = child.href?.split('?')[0];
          const currentPath = pathname.split('?')[0];
          return currentPath === childPath;
        })) return item;

        if (item.children.some(child => {
          if (child.children) {
            return child.children.some(subChild => {
              const subChildPath = subChild.href?.split('?')[0];
              const currentPath = pathname.split('?')[0];
              return currentPath === subChildPath;
            });
          }
          return false;
        })) return item;
      }
    }
    return null;
  };

  const activeParent = getActiveParent();
  const childrenToShow = activeParent?.children?.filter(child => child.roles.includes(user?.role || '')) || [];

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 border-r border-border/60 bg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          open ? 'translate-x-0 z-40' : '-translate-x-full'
        )}
      >
        <div className="h-0.5 bg-gradient-to-r from-[#c8564a] via-[#e07870] to-[#d4874a]" />
        <div className="flex h-full flex-col" />
      </aside>
    );
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 border-r border-border/60 bg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          open ? 'translate-x-0 z-40' : '-translate-x-full'
        )}
      >
        {/* Sidebar top accent */}
        <div className="h-0.5 bg-gradient-to-r from-[#c8564a] via-[#e07870] to-[#d4874a]" />

        <div className="flex h-full flex-col">
          {/* Section label */}
          {activeParent && (
            <div className="px-4 pt-5 pb-2">
              <div className="flex items-center gap-2 mb-1">
                {activeParent.icon && (
                  <activeParent.icon className="h-4 w-4 text-primary" />
                )}
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {activeParent.label}
                </p>
              </div>
              <div className="h-px bg-border/60" />
            </div>
          )}

          <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
            {childrenToShow.map((child) => {
                const Icon = child.icon;
                const isActive = isHrefActive(child.href);
                const childHasActive = hasActiveChild(child.children);
                const hasSubChildren = child.children && child.children.length > 0;
                const isHovered = hoveredItem === child.label;

                if (hasSubChildren) {
                  return (
                    <div
                      key={child.label}
                      onMouseEnter={() => setHoveredItem(child.label)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className={cn('flex items-center gap-3 px-3 py-2.5 text-sm font-medium cursor-pointer rounded-lg transition-all', childHasActive ? 'bg-primary/10 text-primary font-semibold' : 'hover-coral text-sidebar-foreground/80')}>
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        <span>{child.label}</span>
                        <span className="ml-auto text-xs opacity-50">▾</span>
                      </div>
                      {(isHovered || childHasActive) && (
                        <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-primary/20 pl-3">
                          {child.children!.map((subChild) => {
                            const SubIcon = subChild.icon;
                            const isSubActive = isHrefActive(subChild.href);
                            return (
                              <Link
                                key={subChild.href}
                                href={subChild.href!}
                                className={cn(
                                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
                                  isSubActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover-coral text-sidebar-foreground/70'
                                )}
                                onClick={() => onOpenChange(false)}
                              >
                                {SubIcon && <SubIcon className="h-3.5 w-3.5 shrink-0" />}
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
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive ? 'bg-primary/10 text-primary font-semibold shadow-sm' : 'hover-coral text-sidebar-foreground/80'
                    )}
                    onClick={() => onOpenChange(false)}
                  >
                    {Icon && (
                      <span style={{ color: isActive ? 'var(--primary)' : undefined }}>
                        <Icon className="h-4 w-4 shrink-0" />
                      </span>
                    )}
                    <span>{child.label}</span>
                    {isActive && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                    )}
                  </Link>
                );
              })
            }
          </nav>

          {/* Close button for mobile */}
          <div className="border-t border-sidebar-border p-3 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              Đóng menu
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}