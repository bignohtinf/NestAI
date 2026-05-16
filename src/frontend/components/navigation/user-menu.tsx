'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Menu, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useApp();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    router.replace('/auth/login');
    router.refresh();
  };

  // Only show for father and mother roles (not admin, not null/unset)
  if (!user || !user.role || !['father', 'mother'].includes(user.role)) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title="Menu"
          className="h-8 w-8 sm:h-10 sm:w-10 hover-coral"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link 
            href="/profile" 
            className={cn(
              "flex items-center gap-2 cursor-pointer rounded-sm px-2 py-1.5 text-sm transition-colors",
              "hover-coral"
            )}
          >
            <User className="h-4 w-4" />
            <span>Trang cá nhân</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2 cursor-pointer rounded-sm px-2 py-1.5 text-sm transition-colors",
            "text-destructive hover-coral"
          )}
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
