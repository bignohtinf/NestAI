'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { SmartShopping } from '@/components/metrics/smart-shopping';
import { IngredientScanner } from '@/components/metrics/ingredient-scanner';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NutriMartPage() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'shopping' | 'cooking'>('shopping');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'father') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'cooking') {
      setActiveTab('cooking');
    } else {
      setActiveTab('shopping');
    }
  }, [searchParams]);

  if (!user || user.role !== 'father') {
    return null;
  }

  return (
    <MainLayout>
      {activeTab === 'shopping' && (
        <div className="space-y-6">
          <SmartShopping />
        </div>
      )}

      {activeTab === 'cooking' && (
        <div className="space-y-6">
          <IngredientScanner />
        </div>
      )}
    </MainLayout>
  );
}
