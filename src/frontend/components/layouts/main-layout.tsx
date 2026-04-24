'use client';

import React, { ReactNode, useState } from 'react';
import { Header } from '@/components/navigation/header';
import { Sidebar } from '@/components/navigation/sidebar';
import { Footer } from '@/components/navigation/footer';
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav';
import { OnboardingGuard } from '@/components/layouts/onboarding-guard';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <OnboardingGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Left column (cols 1-2) */}
          <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

          {/* Main content - Right columns (cols 3-12) */}
          <main className="flex-1 overflow-y-auto min-w-0">
            <div className="w-full px-3 py-4 sm:px-4 sm:py-6 md:px-6 pb-24 md:pb-6">
              {children}
            </div>
          </main>
        </div>
        <Footer className="hidden md:block" />
        <MobileBottomNav />
      </div>
    </OnboardingGuard>
  );
}
