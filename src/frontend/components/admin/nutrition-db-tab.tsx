'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NutritionDbTab() {
  const [foods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);

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
        {foods.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No foods available. Foods will be loaded from API.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
