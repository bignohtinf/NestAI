'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import AdminHeader from './admin-header';
import AdminSidebar, { type MenuState } from './admin-sidebar';
import { BotAnimation } from '../nori/bot-animation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useApp();
  const [mounted, setMounted] = useState(false);
  const [menuState, setMenuState] = useState<MenuState>('full');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [previousDesktopState, setPreviousDesktopState] = useState<MenuState>('full');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsMobile(!isDesktop);

      if (!isDesktop) {
        if (menuState !== 'hidden') {
          setPreviousDesktopState(menuState);
          setMenuState('hidden');
        }
      } else {
        if (menuState === 'hidden' && previousDesktopState !== 'hidden') {
          setMenuState(previousDesktopState);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuState, previousDesktopState]);

  // Cycle through menu states: full -> collapsed -> hidden -> full
  const toggleMenuState = () => {
    setMenuState((prev) => {
      switch (prev) {
        case 'full':
          return 'collapsed';
        case 'collapsed':
          return 'hidden';
        case 'hidden':
          return 'full';
        default:
          return 'full';
      }
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Calculate margin based on menu state
  const getMarginLeft = () => {
    if (isMobile) return '0';
    if (menuState === 'hidden') return '0';
    if (menuState === 'collapsed') return '4rem';
    return '16rem';
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="relative mb-6">
            {/* Running light pink circle */}
            <div className="w-24 h-24 rounded-full border-4 border-rose-100 dark:border-rose-900/30 border-t-rose-400 dark:border-t-rose-500 animate-spin mx-auto" />

            {/* Bot Animation inside the circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="scale-50">
                <BotAnimation />
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
            Đang tải dữ liệu hệ thống...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <AdminSidebar
        menuState={menuState}
        setMenuState={setMenuState}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div
        className="w-full flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0"
        style={{ marginLeft: getMarginLeft() }}
      >
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0 sticky top-0 z-40">
          <AdminHeader
            menuState={menuState}
            onToggleMenu={toggleMenuState}
            onToggleMobileMenu={toggleMobileMenu}
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-6 bg-white dark:bg-gray-950 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
