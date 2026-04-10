'use client';

import { Bell, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/lib/types';
import Link from 'next/link';

interface HeaderProps {
  user?: User;
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-muted rounded-lg"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BẮT</span>
            </div>
            <span className="hidden sm:inline font-semibold text-foreground">Bữa Ăn Thông Minh</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <Link href="/settings">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </Link>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
