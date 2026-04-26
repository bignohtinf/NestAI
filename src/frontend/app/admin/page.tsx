'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeManagementTab } from '@/components/admin/recipe-management-tab';
import { NutritionDbTab } from '@/components/admin/nutrition-db-tab';
import { VoiceAITab } from '@/components/admin/voice-ai-tab';
import { PartnersTab } from '@/components/admin/partners-tab';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">

        <Tabs defaultValue="recipes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recipes">
              <span className="hidden sm:inline">Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition">
              <span className="hidden sm:inline">Nutrition DB</span>
            </TabsTrigger>
            <TabsTrigger value="voice">
              <span className="hidden sm:inline">Voice AI</span>
            </TabsTrigger>
            <TabsTrigger value="partners">
              <span className="hidden sm:inline">Partners</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes">
            <RecipeManagementTab />
          </TabsContent>

          <TabsContent value="nutrition">
            <NutritionDbTab />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceAITab />
          </TabsContent>

          <TabsContent value="partners">
            <PartnersTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
