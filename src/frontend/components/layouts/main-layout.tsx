'use client';

import { ReactNode, useState } from 'react';
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
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto w-full">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
              {children}
            </div>
            <Footer className="hidden md:block mt-auto" />
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </OnboardingGuard>
  );
}
