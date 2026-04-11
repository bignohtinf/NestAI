'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockUser, mockMeals } from '@/lib/mock-data';
import { Plus, Clock, Users, Flame, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Meal } from '@/lib/types';

interface MealPlan {
  day: string;
  meals: {
    [key: string]: Meal[];
  };
}

const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealLabels = {
  breakfast: 'Bữa sáng',
  lunch: 'Bữa trưa',
  dinner: 'Bữa tối',
  snack: 'Ăn vặt',
};

export default function MenuPlanner() {
  const [weekPlan, setWeekPlan] = useState<MealPlan[]>(
    daysOfWeek.map((day) => ({
      day,
      meals: {
        breakfast: [mockMeals[2]],
        lunch: [mockMeals[1]],
        dinner: [mockMeals[0]],
        snack: [mockMeals[4]],
      },
    }))
  );

  const [selectedDay, setSelectedDay] = useState<number>(0);

  const calculateTotalNutrition = (meals: Meal[]) => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.nutrition.calories,
        protein: acc.protein + meal.nutrition.protein,
        carbs: acc.carbs + meal.nutrition.carbs,
        fat: acc.fat + meal.nutrition.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const removeMeal = (dayIndex: number, mealType: string, mealIndex: number) => {
    const newPlan = [...weekPlan];
    newPlan[dayIndex].meals[mealType as keyof typeof mealLabels] = newPlan[dayIndex].meals[mealType as keyof typeof mealLabels].filter(
      (_, i) => i !== mealIndex
    );
    setWeekPlan(newPlan);
  };

  const addMealToDay = (dayIndex: number, mealType: string, meal: Meal) => {
    const newPlan = [...weekPlan];
    if (!newPlan[dayIndex].meals[mealType]) {
      newPlan[dayIndex].meals[mealType as keyof typeof mealLabels] = [];
    }
    newPlan[dayIndex].meals[mealType as keyof typeof mealLabels].push(meal);
    setWeekPlan(newPlan);
  };

  const currentDayPlan = weekPlan[selectedDay];
  const dayTotalNutrition = Object.values(currentDayPlan.meals).flat();
  const dayNutrition = calculateTotalNutrition(dayTotalNutrition);

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Lập menu tuần</h1>
          <p className="text-muted-foreground">Kế hoạch bữa ăn toàn tuần theo mục tiêu dinh dưỡng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Days Navigation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Chọn ngày</h3>
            <div className="space-y-2">
              {daysOfWeek.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedDay === index
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium text-foreground">{day}</p>
                  <p className="text-xs text-muted-foreground">{dayNutrition.calories.toFixed(0)} kcal</p>
                </button>
              ))}
            </div>
          </div>

          {/* Meals for Selected Day */}
          <div className="lg:col-span-2 space-y-4">
            {/* Daily Summary */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Tổng hợp ngày {currentDayPlan.day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground">Calo</p>
                    <p className="text-2xl font-bold text-primary">{dayNutrition.calories.toFixed(0)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/10 text-center">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-2xl font-bold text-accent">{dayNutrition.protein.toFixed(0)}g</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-500/10 text-center">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-2xl font-bold text-sky-500">{dayNutrition.carbs.toFixed(0)}g</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-2xl font-bold text-yellow-500">{dayNutrition.fat.toFixed(0)}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals by Type */}
            <div className="space-y-4">
              {mealTypes.map((mealType) => (
                <Card key={mealType} className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {mealLabels[mealType as keyof typeof mealLabels]}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Open meal selector modal
                          alert('Chọn bữa ăn từ danh sách công thức');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentDayPlan.meals[mealType as keyof typeof mealLabels]?.length > 0 ? (
                      <>
                        {currentDayPlan.meals[mealType as keyof typeof mealLabels].map((meal, index) => {
                          const mealNutrition = calculateTotalNutrition([meal]);
                          return (
                            <div key={index} className="flex items-start justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{meal.name}</p>
                                <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
                                    <Flame className="w-3 h-3 text-primary" />
                                    {mealNutrition.calories.toFixed(0)} kcal
                                  </span>
                                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
                                    <Clock className="w-3 h-3" />
                                    {(meal.prepTime || 0) + (meal.cookTime || 0)} min
                                  </span>
                                  {meal.servings && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
                                      <Users className="w-3 h-3" />
                                      {meal.servings} phần
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => removeMeal(selectedDay, mealType, index)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Chưa thêm bữa ăn</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Recipe Suggestions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Công thức nấu ăn có sẵn</CardTitle>
            <CardDescription>Thêm các công thức này vào kế hoạch của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMeals.map((meal) => {
                const nutrition = meal.nutrition;
                return (
                  <div key={meal.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold text-foreground mb-1">{meal.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                    <div className="space-y-2 mb-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Calo:</span>
                        <span className="font-medium text-primary">{nutrition.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Protein:</span>
                        <span className="font-medium text-accent">{nutrition.protein}g</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {meal.tags?.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-muted text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border text-xs"
                        onClick={() => addMealToDay(selectedDay, 'lunch', meal)}
                      >
                        Thêm
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Export/Share */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" className="border-border">
            Tải PDF
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            Lưu kế hoạch
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
