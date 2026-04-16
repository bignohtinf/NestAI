'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { foodsDatabase } from '@/lib/mock-data';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NutritionDbTab() {
  const [foods] = useState(foodsDatabase);
  const [selectedFood, setSelectedFood] = useState<typeof foodsDatabase[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Add New Food */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nutrition Database</CardTitle>
          <CardDescription>Manage foods and their nutritional values</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add New Food Item
          </Button>
        </CardContent>
      </Card>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {foods.map((food) => (
          <Card key={food.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{food.name}</h3>
                  <div className="mt-2 space-y-1">
                    <Badge variant={
                      food.safetyStatus === 'safe'
                        ? 'default'
                        : food.safetyStatus === 'caution'
                          ? 'secondary'
                          : 'destructive'
                    }>
                      {food.safetyStatus.charAt(0).toUpperCase() + food.safetyStatus.slice(1)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Category: {food.category} • Score: {food.healthScore}/100
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFood(food)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Food Detail View */}
      {selectedFood && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedFood.name}</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setSelectedFood(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-semibold capitalize">{selectedFood.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="font-semibold">{selectedFood.healthScore}/100</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Safety Status</p>
                <Badge variant={
                  selectedFood.safetyStatus === 'safe'
                    ? 'default'
                    : selectedFood.safetyStatus === 'caution'
                      ? 'secondary'
                      : 'destructive'
                }>
                  {selectedFood.safetyStatus}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Nutrition Info (per 100g)</h4>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                <div className="rounded bg-muted p-2 text-sm">
                  <p className="text-muted-foreground">Calories</p>
                  <p className="font-semibold">{selectedFood.nutritionInfo.calories}</p>
                </div>
                <div className="rounded bg-muted p-2 text-sm">
                  <p className="text-muted-foreground">Protein</p>
                  <p className="font-semibold">{selectedFood.nutritionInfo.protein}g</p>
                </div>
                <div className="rounded bg-muted p-2 text-sm">
                  <p className="text-muted-foreground">Carbs</p>
                  <p className="font-semibold">{selectedFood.nutritionInfo.carbs}g</p>
                </div>
                <div className="rounded bg-muted p-2 text-sm">
                  <p className="text-muted-foreground">Fat</p>
                  <p className="font-semibold">{selectedFood.nutritionInfo.fat}g</p>
                </div>
                <div className="rounded bg-muted p-2 text-sm">
                  <p className="text-muted-foreground">Calcium</p>
                  <p className="font-semibold">{selectedFood.nutritionInfo.calcium}mg</p>
                </div>
                <div className="rounded bg-muted p-2 text-sm">
                  <p className="text-muted-foreground">Iron</p>
                  <p className="font-semibold">{selectedFood.nutritionInfo.iron}mg</p>
                </div>
              </div>
            </div>

            {selectedFood.benefits.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Benefits</h4>
                <ul className="space-y-1">
                  {selectedFood.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      ✓ {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedFood.risks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-yellow-700 dark:text-yellow-200">Risks</h4>
                <ul className="space-y-1">
                  {selectedFood.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-200">
                      ⚠️ {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-semibold mb-1">Cooking Tips</p>
              <p className="text-sm text-muted-foreground">{selectedFood.cookingTips}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
