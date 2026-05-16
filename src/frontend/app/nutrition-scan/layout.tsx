'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';

export default function NutritionScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useAuthGuard({ allowedRoles: ['mother', 'father'] });
  if (!ready) return null;

  return (
    <MainLayout fullWidth>
      <div className="pt-2">
        {children}
      </div>
    </MainLayout>
  );
}
