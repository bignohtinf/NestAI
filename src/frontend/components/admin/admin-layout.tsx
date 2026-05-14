'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import AdminHeader from './admin-header';
import AdminSidebar, { type MenuState } from './admin-sidebar';
import { LoadingOverlay } from './loading-overlay';

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

  // Avoid hydration mismatch on first paint — isMobile detection happens in
  // a useEffect and would otherwise differ between server and client render.
  // We render a blank canvas of the same background so the page doesn't flash.
  if (!mounted) {
    return <div className="h-screen bg-white dark:bg-gray-950" />;
  }

  // Confirmed not admin — return null and let the redirect effect kick in.
  if (sessionStatus === 'authenticated' && (!user || user.role !== 'admin')) {
    return null;
  }
  if (sessionStatus === 'unauthenticated') {
    return null;
  }

  // Show the loading overlay (instead of a full-screen loading page) whenever
  // we're either still checking auth or still loading user data. The admin
  // shell — sidebar + header + main area — stays visible underneath with a
  // blurred backdrop, so the page feels like it's loading in place rather
  // than navigating to a separate "loading screen".
  const showAuthOverlay = sessionStatus === 'checking' || isLoading;

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

        {/* Page Content — relative so the overlay can be absolutely positioned
            on top of children. We render children only once auth is resolved
            so admin sub-pages don't fire fetches before we know the user is
            actually an admin (those fetches would 401 and pollute logs). The
            shell (sidebar + header) stays visible underneath the overlay, so
            it still feels like "the admin page is loading", not a separate
            loading screen. */}
        <main className="relative flex-1 overflow-auto p-3 sm:p-6 bg-white dark:bg-gray-950 min-w-0">
          {showAuthOverlay ? (
            <LoadingOverlay />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
