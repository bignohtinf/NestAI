'use client';

import React, { ReactNode } from 'react';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';

interface HomeLayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Main content - Centered with side margins */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6 md:px-6">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
