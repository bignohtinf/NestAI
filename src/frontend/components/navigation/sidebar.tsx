'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  X,
  Home,
  Utensils,
  MessageCircle,
  Baby,
  HeartPulse,
  Bell,
  ShoppingCart,
  Calendar,
  Settings,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import Image from 'next/image';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  href?: string;
  label: string;
  icon?: any;
  roles: string[];
}

const navigationItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', icon: Home, roles: ['mother', 'father', 'admin'] },
  
  // Mother
  { href: '/nutrition-scan', label: 'Thực đơn AI', icon: Utensils, roles: ['mother'] },
  
  { href: '/nori', label: 'Nori AI', icon: MessageCircle, roles: ['mother', 'father'] },
  { href: '/baby-journey', label: 'Hành trình bé', icon: Baby, roles: ['mother', 'father'] },
  
  // Mother Health
  { href: '/wellness', label: 'Sức khỏe', icon: HeartPulse, roles: ['mother'] },
  
  { href: '/notifications', label: 'Thông báo', icon: Bell, roles: ['mother', 'father'] },
  
  // Father
  { href: '/nutrimart', label: 'NutriMart', icon: ShoppingCart, roles: ['father'] },
  { href: '/planner', label: 'Kế Hoạch', icon: Calendar, roles: ['father'] },
  
  // Admin
  { href: '/admin', label: 'Quản trị', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();

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
              <Link
                key={item.label}
                href={item.href!}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                {Icon && <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
