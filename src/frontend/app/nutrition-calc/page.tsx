'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockUser, mockMeals } from '@/lib/mock-data';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Meal } from '@/lib/types';

interface SelectedMeal {
  meal: Meal;
  servings: number;
}

export default function NutritionCalculator() {
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([
    { meal: mockMeals[0], servings: 1 },
    { meal: mockMeals[1], servings: 1 },
  ]);

  const calculateTotalNutrition = () => {
    return selectedMeals.reduce(
      (acc, item) => ({
        calories: acc.calories + item.meal.nutrition.calories * item.servings,
        protein: acc.protein + item.meal.nutrition.protein * item.servings,
        carbs: acc.carbs + item.meal.nutrition.carbs * item.servings,
        fat: acc.fat + item.meal.nutrition.fat * item.servings,
        fiber: (acc.fiber || 0) + (item.meal.nutrition.fiber || 0) * item.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  const totalNutrition = calculateTotalNutrition();
  const macroPercent = {
    protein: (totalNutrition.protein * 4 / totalNutrition.calories) * 100 || 0,
    carbs: (totalNutrition.carbs * 4 / totalNutrition.calories) * 100 || 0,
    fat: (totalNutrition.fat * 9 / totalNutrition.calories) * 100 || 0,
  };

  const updateServings = (index: number, servings: number) => {
    const newMeals = [...selectedMeals];
    newMeals[index].servings = Math.max(0.5, servings);
    setSelectedMeals(newMeals);
  };

  const removeMeal = (index: number) => {
    setSelectedMeals(selectedMeals.filter((_, i) => i !== index));
  };

  const addMeal = (meal: Meal) => {
    setSelectedMeals([...selectedMeals, { meal, servings: 1 }]);
  };

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Tính toán dinh dưỡng</h1>
          <p className="text-muted-foreground">Tính toán tổng dinh dưỡng từ các bữa ăn của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Meals */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bữa ăn đã chọn</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedMeals([])}
                    className="text-xs"
                  >
                    Xóa tất cả
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedMeals.map((item, index) => {
                  const mealNutrition = {
                    calories: item.meal.nutrition.calories * item.servings,
                    protein: item.meal.nutrition.protein * item.servings,
                    carbs: item.meal.nutrition.carbs * item.servings,
                    fat: item.meal.nutrition.fat * item.servings,
                  };

                  return (
                    <div key={index} className="p-4 rounded-lg border border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.meal.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.meal.description}</p>
                        </div>
                        <button
                          onClick={() => removeMeal(index)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Servings Control */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-foreground">Khẩu phần:</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateServings(index, item.servings - 0.5)}
                              className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.servings}
                              onChange={(e) => updateServings(index, parseFloat(e.target.value) || 0.5)}
                              className="w-12 h-8 px-2 py-1 text-center border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              step="0.5"
                              min="0.5"
                            />
                            <button
                              onClick={() => updateServings(index, item.servings + 0.5)}
                              className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Nutrition Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 rounded bg-muted">
                            <p className="text-muted-foreground">Calo</p>
                            <p className="font-semibold text-primary">{mealNutrition.calories.toFixed(0)}</p>
                          </div>
                          <div className="p-2 rounded bg-muted">
                            <p className="text-muted-foreground">Protein</p>
                            <p className="font-semibold text-accent">{mealNutrition.protein.toFixed(1)}g</p>
                          </div>
                          <div className="p-2 rounded bg-muted">
                            <p className="text-muted-foreground">Carbs</p>
                            <p className="font-semibold text-sky-500">{mealNutrition.carbs.toFixed(1)}g</p>
                          </div>
                          <div className="p-2 rounded bg-muted">
                            <p className="text-muted-foreground">Fat</p>
                            <p className="font-semibold text-yellow-500">{mealNutrition.fat.toFixed(1)}g</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {selectedMeals.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Chưa chọn bữa ăn nào</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Total Nutrition */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Tổng dinh dưỡng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-primary/10">
                  <p className="text-xs text-muted-foreground">Calo</p>
                  <p className="text-3xl font-bold text-primary">{totalNutrition.calories.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">kcal</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-xl font-bold text-accent">{totalNutrition.protein.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground mt-1">{macroPercent.protein.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-500/10">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-xl font-bold text-sky-500">{totalNutrition.carbs.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground mt-1">{macroPercent.carbs.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-xl font-bold text-yellow-500">{totalNutrition.fat.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground mt-1">{macroPercent.fat.toFixed(0)}%</p>
                  </div>
                </div>

                {totalNutrition.fiber > 0 && (
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <p className="text-xs text-muted-foreground">Chất xơ</p>
                    <p className="text-lg font-bold text-green-600">{totalNutrition.fiber.toFixed(1)}g</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Macro Distribution */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Phân bổ Macro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">Protein</span>
                    <span className="font-semibold text-accent">{macroPercent.protein.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${Math.min(macroPercent.protein, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">Carbs</span>
                    <span className="font-semibold text-sky-500">{macroPercent.carbs.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full"
                      style={{ width: `${Math.min(macroPercent.carbs, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">Fat</span>
                    <span className="font-semibold text-yellow-500">{macroPercent.fat.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full"
                      style={{ width: `${Math.min(macroPercent.fat, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Meals */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Công thức nấu ăn có sẵn</CardTitle>
            <CardDescription>Thêm bữa ăn để tính toán dinh dưỡng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMeals.map((meal) => (
                <div key={meal.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <h4 className="font-semibold text-foreground mb-2">{meal.name}</h4>
                  <div className="space-y-1 mb-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calo:</span>
                      <span className="font-medium">{meal.nutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protein:</span>
                      <span className="font-medium">{meal.nutrition.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carbs:</span>
                      <span className="font-medium">{meal.nutrition.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fat:</span>
                      <span className="font-medium">{meal.nutrition.fat}g</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-xs"
                    onClick={() => addMeal(meal)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Thêm
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save/Export */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" className="border-border">
            In PDF
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <TrendingUp className="w-4 h-4 mr-2" />
            Lưu kết quả
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
