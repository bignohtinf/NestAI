'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeManagementTab } from '@/components/admin/recipe-management-tab';
import { NutritionDbTab } from '@/components/admin/nutrition-db-tab';
import { VoiceAITab } from '@/components/admin/voice-ai-tab';
import { PartnersTab } from '@/components/admin/partners-tab';
import { BookOpen, Apple, Mic, Users } from 'lucide-react';
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
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage system content, configuration, and partnerships</p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            ⚠️ Admin Mode - Configuration for system administrators only
          </p>
        </div>

        <Tabs defaultValue="recipes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recipes" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-2">
              <Apple className="h-4 w-4" />
              <span className="hidden sm:inline">Nutrition DB</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice AI</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-2">
              <Users className="h-4 w-4" />
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
