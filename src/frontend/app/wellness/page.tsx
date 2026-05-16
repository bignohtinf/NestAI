'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';
import { DashboardSection } from './components/sections/DashboardSection';
import { TrackingLayoutSection } from './components/sections/TrackingLayoutSection';
import { SupportSection } from './components/sections/SupportSection';
import { PersonalizationDialog } from './components/PersonalizationDialog';
import { useWellnessData } from './hooks/useWellnessData';

function WellnessPageInner() {
  const { ready, user } = useAuthGuard({ allowedRoles: ['mother'] });
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracking' | 'support'>('dashboard');
  const [showPersonalization, setShowPersonalization] = useState(false);

  const { profile, loading } = useWellnessData(user?.id || null);

  // Show personalization dialog if not completed
  useEffect(() => {
    if (!loading && profile && !profile.personalization_completed) {
      setShowPersonalization(true);
    }
  }, [profile, loading]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (['dashboard', 'tracking', 'support'].includes(tab || '')) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  if (!ready) return null;

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
