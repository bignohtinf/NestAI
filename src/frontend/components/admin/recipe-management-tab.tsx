'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { recipesDatabase } from '@/lib/mock-data';
import { Edit2, Plus, Trash2, Eye } from 'lucide-react';

export function RecipeManagementTab() {
  const [recipes] = useState(recipesDatabase);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof recipesDatabase[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Add New Recipe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recipe Management</CardTitle>
          <CardDescription>Add, edit, or delete recipes from the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add New Recipe
          </Button>
        </CardContent>
      </Card>

      {/* Recipes List */}
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{recipe.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Servings: {recipe.servings} • Time: {recipe.estimatedTime}min</p>
                    <p>Difficulty: {recipe.difficulty} • Nutrition Score: {recipe.nutritionScore}/100</p>
                    <p>Ingredients: {recipe.ingredients.length}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRecipe(recipe)}
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

      {/* Recipe Detail View */}
      {selectedRecipe && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedRecipe.name}</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setSelectedRecipe(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <p className="font-semibold capitalize">{selectedRecipe.difficulty}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-semibold">{selectedRecipe.estimatedTime} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Servings</p>
                <p className="font-semibold">{selectedRecipe.servings}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nutrition Score</p>
                <p className="font-semibold">{selectedRecipe.nutritionScore}/100</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Ingredients</h4>
              <ul className="space-y-1">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {ing.amount}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ol className="space-y-1">
                {selectedRecipe.instructions.map((inst, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {idx + 1}. {inst}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
