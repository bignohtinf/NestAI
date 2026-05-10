'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, formatGestationAge } from '@/lib/utils';
import { UserMenu } from '@/components/navigation/user-menu';
import { NotificationBell } from '@/components/navigation/notification-bell';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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

  // Skeleton before mount
  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 h-16 flex items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-md md:hidden" />
          <div className="w-8 h-8 bg-muted rounded-full hidden md:block" />
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:px-6 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-9 w-9 p-0 hover:bg-primary/10 shrink-0 text-muted-foreground"
            aria-label="Mo menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Image src="/img_0174.png" alt="NestAI Logo" width={28} height={28} className="object-contain" />
            <span className="font-bold text-primary tracking-tight">NestAI</span>
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {user && (
          <>
            <div className="hidden sm:flex flex-col items-end text-right mr-1">
              <span className="text-sm font-semibold text-foreground leading-tight">{user.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {user.babyStatus === 'pregnant' && user.gestationWeeks != null
                  ? formatGestationAge(user.gestationWeeks, user.daysInWeek)
                  : user.babyStatus === 'born' && user.weeksPostpartum != null
                  ? `Tuần ${user.weeksPostpartum} sau sinh`
                  : user.age != null
                  ? `${user.age} tuổi`
                  : user.role === 'admin'
                  ? 'Admin'
                  : ''}
              </span>
            </div>

            {/* Bell icon nam sat ten */}
            <NotificationBell />

            {['father', 'mother'].includes(user.role) ? (
              <UserMenu />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                title="Dang xuat"
                className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
