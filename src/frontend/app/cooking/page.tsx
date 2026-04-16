'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChefHat, Clock, Users } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: string[];
}

const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Cá hồi nướng với rau xanh',
    time: 30,
    servings: 2,
    difficulty: 'easy',
    steps: [
      'Rửa sạch cá hồi',
      'Ướp với muối, tiêu, dầu olive',
      'Nướng ở 200°C trong 15 phút',
      'Thêm rau xanh và nước chanh',
    ],
  },
  {
    id: '2',
    name: 'Cơm chiên với trứng',
    time: 20,
    servings: 2,
    difficulty: 'easy',
    steps: [
      'Đun nóng dầu trong chảo',
      'Đánh trứng vào chảo',
      'Thêm cơm và rau',
      'Nêm gia vị và trộn đều',
    ],
  },
];

export default function CookingPage() {
  const { user } = useApp();
  const router = useRouter();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'father') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'father') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nấu ăn</h1>
          <p className="text-muted-foreground">Hướng dẫn nấu ăn từng bước</p>
        </div>

        {!selectedRecipe ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">{recipe.name}</h3>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.time} phút
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings} người
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setCurrentStep(0);
                    }}
                    className="w-full"
                  >
                    Bắt đầu nấu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                {selectedRecipe.name}
              </CardTitle>
              <CardDescription>
                Bước {currentStep + 1}/{selectedRecipe.steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress */}
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / selectedRecipe.steps.length) * 100}%` }}
                />
              </div>

              {/* Current Step */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                  {selectedRecipe.steps[currentStep]}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex-1"
                >
                  ← Quay lại
                </Button>
                {currentStep < selectedRecipe.steps.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex-1"
                  >
                    Tiếp theo →
                  </Button>
                ) : (
                  <Button
                    onClick={() => setSelectedRecipe(null)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Hoàn thành ✓
                  </Button>
                )}
              </div>

              {/* All Steps */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Tất cả bước:</p>
                {selectedRecipe.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      idx === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : idx < currentStep
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'
                    }`}
                    onClick={() => setCurrentStep(idx)}
                  >
                    <p className="text-sm">
                      {idx < currentStep ? '✓' : idx === currentStep ? '▶' : '○'} Bước {idx + 1}: {step}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
