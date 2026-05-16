'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import {
  X,
  Home,
  Utensils,
  MessageCircle,
  Baby,
  HeartPulse,
  Bell,
  ShoppingCart,
  Settings,
  Camera,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import Image from 'next/image';
import { ChatHistoryTab } from '@/components/chat/chat-history-tab';
import { nutritionApi } from '@/lib/api';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeChatId?: string | null;
  onSelectChat?: (chatId: string) => void;
}

interface NavItem {
  href?: string;
  label: string;
  icon?: any;
  roles: string[];
  subItems?: { href: string; label: string; icon: any }[];
}

const navigationItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', icon: Home, roles: ['mother', 'father', 'admin'] },

  // Mother
  {
    href: '/nutrition-scan',
    label: 'Thực đơn AI',
    icon: Utensils,
    roles: ['mother'],
    subItems: [
      { href: '/nutrition-scan/scan', label: 'Quét ảnh', icon: Camera },
      { href: '/nutrition-scan/generate', label: 'Gen thực đơn', icon: Utensils }
    ]
  },

  { href: '/nori', label: 'Nori AI', icon: MessageCircle, roles: ['mother', 'father'] },
  { href: '/baby-journey', label: 'Hành trình bé', icon: Baby, roles: ['mother', 'father'] },
  { href: '/blogs', label: 'Cẩm nang', icon: BookOpen, roles: ['mother', 'father'] },

  // Mother Health
  {
    href: '/wellness',
    label: 'Sức khỏe',
    icon: HeartPulse,
    roles: ['mother'],
    subItems: [
      { href: '/wellness?tab=dashboard', label: 'Dashboard', icon: Home },
      { href: '/wellness?tab=tracking', label: 'Track & Challenges', icon: Utensils },
      { href: '/wellness?tab=support', label: 'Support', icon: Bell }
    ]
  },

  { href: '/notifications', label: 'Thông báo', icon: Bell, roles: ['mother', 'father'] },

  // Father
  { href: '/nutrimart', label: 'NutriMart', icon: ShoppingCart, roles: ['father'] },
  { href: '/nutrition-report', label: 'Báo cáo Dinh dưỡng', icon: Utensils, roles: ['father'] },

  // Admin
  { href: '/admin', label: 'Quản trị', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ open, onOpenChange, activeChatId, onSelectChat }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await nutritionApi.getNotifications(user.id, true, 1);
      setUnreadCount(res.unread_count || 0);
    } catch {
      // Silent fail — notification badge không critical, không crash UI
    }
  }, [user?.id]);

  useEffect(() => {
    // Delay lần đầu 3s để backend có thời gian warm up
    const initialDelay = setTimeout(fetchUnreadCount, 3000);

    // Poll mỗi 3 phút (thay vì 60s) — giảm áp lực cold start Cloud Run
    const interval = setInterval(fetchUnreadCount, 180_000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    const stored = localStorage.getItem('showChatHistory');
    if (stored !== null) {
      setShowChatHistory(JSON.parse(stored));
    }

    // Listen for custom event from toggle button
    const handleToggleEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setShowChatHistory(customEvent.detail);
    };

    // Listen for notification updates
    const handleNotificationUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener('chatHistoryToggle', handleToggleEvent);
    window.addEventListener('notificationsUpdated', handleNotificationUpdate);

    return () => {
      window.removeEventListener('chatHistoryToggle', handleToggleEvent);
      window.removeEventListener('notificationsUpdated', handleNotificationUpdate);
    };
  }, [fetchUnreadCount]);

  const filteredItems = navigationItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl shadow-sm transition-transform duration-300 ease-in-out flex flex-col md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center px-6 border-b border-border/30 shrink-0 justify-between md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            onClick={() => onOpenChange(false)}
          >
            <Image
              src="/img_0174.png"
              alt="NestAI Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-bold text-xl text-primary tracking-tight">NestAI</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="md:hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const pathWithoutQuery = pathname.split('?')[0];
            const itemPathWithoutQuery = item.href?.split('?')[0];

            const isActive = item.href === '/'
              ? pathWithoutQuery === '/'
              : pathWithoutQuery.startsWith(itemPathWithoutQuery || '');

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href!}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                  )}
                >
                  {Icon && <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />}
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Thông báo' && unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in duration-300">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Sub Items for Nutrition Scan */}
                {item.subItems && (isActive || hoveredItem === item.label) && (
                  <div className="mt-1 ml-6 flex flex-col gap-1 border-l border-border/30 pl-3">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                            isSubActive
                              ? 'text-[#0075de] bg-[#0075de]/5'
                              : 'text-muted-foreground hover:text-[#0075de] hover:bg-[#0075de]/5'
                          )}
                        >
                          {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Chat History Tab - Show under Nori */}
                {item.label === 'Nori AI' && (isActive || hoveredItem === 'Nori AI') && (
                  <div className="mt-2 ml-2 border-l border-border/30 pl-3">
                    <ChatHistoryTab
                      activeChatId={activeChatId}
                      onSelectChat={(chatId) => {
                        console.log('Selected chat:', chatId);
                        onSelectChat?.(chatId);
                        onOpenChange(false);
                      }}
                      isVisible={showChatHistory}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
