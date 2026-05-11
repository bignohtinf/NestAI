'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { DashboardSection } from './components/sections/DashboardSection';
import { TrackingLayoutSection } from './components/sections/TrackingLayoutSection';
import { SupportSection } from './components/sections/SupportSection';
import { PersonalizationDialog } from './components/PersonalizationDialog';
import { useWellnessData } from './hooks/useWellnessData';

function WellnessPageInner() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracking' | 'support'>('dashboard');
  const [mounted, setMounted] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);

  const { profile, loading } = useWellnessData(user?.id || null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  // Show personalization dialog if not completed
  useEffect(() => {
    if (!loading && profile && !profile.personalization_completed) {
      setShowPersonalization(true);
    }
  }, [profile, loading]);

  useEffect(() => {
    if (!mounted) return;
    const tab = searchParams.get('tab');
    if (['dashboard', 'tracking', 'support'].includes(tab || '')) {
      setActiveTab(tab as any);
    }
  }, [searchParams, mounted]);

  if (!mounted || !user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout fullWidth>
      {/* Personalization Dialog */}
      {showPersonalization && (
        <PersonalizationDialog
          userId={user.id}
          isOpen={showPersonalization}
          onClose={() => setShowPersonalization(false)}
        />
      )}

      <div className="space-y-4">
        {activeTab === 'dashboard' && (
          <DashboardSection
            userId={user.id}
            onTrackClick={() => setActiveTab('tracking')}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingLayoutSection userId={user.id} />
        )}

        {activeTab === 'support' && (
          <SupportSection userId={user.id} />
        )}
      </div>
    </MainLayout>
  );
}

export default function WellnessPage() {
  return (
    <Suspense fallback={null}>
      <WellnessPageInner />
    </Suspense>
  );
}
