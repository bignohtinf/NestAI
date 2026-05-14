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
  const { user, isLoading, sessionStatus, fetchUserData } = useApp();
  const [mounted, setMounted] = useState(false);
  const [menuState, setMenuState] = useState<MenuState>('full');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [previousDesktopState, setPreviousDesktopState] = useState<MenuState>('full');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only redirect when we have a definitive answer:
  //  - confirmed unauthenticated (no Supabase session at all), OR
  //  - confirmed authenticated but the user is not an admin.
  // We deliberately do NOT redirect when sessionStatus === 'checking' or
  // 'error' — those mean "we don't know yet" and redirecting would log the
  // user out mid-load when a backend call is slow.
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/');
      return;
    }
    if (sessionStatus === 'authenticated' && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [sessionStatus, user, router]);

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

  // Transient error (session is valid but we couldn't load the user record).
  // Show a clear retry UI instead of silently kicking the user back to the
  // landing page.
  if (sessionStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không tải được phiên đăng nhập
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Có thể do mạng chậm hoặc máy chủ đang quá tải. Phiên đăng nhập của bạn vẫn còn hiệu lực.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => fetchUserData()}
              className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial check or user record still loading.
  if (!mounted || sessionStatus === 'checking' || isLoading) {
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
