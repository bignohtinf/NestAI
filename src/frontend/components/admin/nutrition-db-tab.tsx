'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddFoodForm } from '@/components/admin/add-food-form';

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  price: number;
  category: string;
  serving_size: number;
  unit: string;
}

export function NutritionDbTab() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/nutrition-database?limit=100');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setFoods(data.foods || []);
    } catch (error) {
      console.error('Failed to fetch nutrition database:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (foodId: string) => {
    if (!confirm('Bạn có chắc muốn xóa thực phẩm này?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/nutrition-database/${foodId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setFoods(foods.filter(f => f.id !== foodId));
    } catch (error) {
      console.error('Failed to delete food:', error);
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'vegetable': 'bg-green-100 text-green-800',
      'fruit': 'bg-red-100 text-red-800',
      'protein': 'bg-blue-100 text-blue-800',
      'dairy': 'bg-yellow-100 text-yellow-800',
      'grain': 'bg-amber-100 text-amber-800',
      'supplement': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Add Form */}
      {showForm && (
        <AddFoodForm
          onSuccess={() => {
            setShowForm(false);
            fetchFoods();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cơ sở dữ liệu Dinh dưỡng</h3>
          <p className="text-sm text-muted-foreground">Quản lý danh sách thực phẩm và giá trị dinh dưỡng</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm thực phẩm
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Tìm kiếm thực phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Foods Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách thực phẩm ({filteredFoods.length})</CardTitle>
          <CardDescription>Tổng cộng {foods.length} thực phẩm trong cơ sở dữ liệu</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {foods.length === 0 ? 'Chưa có thực phẩm nào. Hãy thêm thực phẩm mới.' : 'Không tìm thấy thực phẩm phù hợp.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Tên</th>
                    <th className="text-left py-3 px-4 font-semibold">Danh mục</th>
                    <th className="text-right py-3 px-4 font-semibold">Calo</th>
                    <th className="text-right py-3 px-4 font-semibold">Protein (g)</th>
                    <th className="text-right py-3 px-4 font-semibold">Carbs (g)</th>
                    <th className="text-right py-3 px-4 font-semibold">Fat (g)</th>
                    <th className="text-right py-3 px-4 font-semibold">Giá</th>
                    <th className="text-center py-3 px-4 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((food) => (
                    <tr key={food.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{food.name}</td>
                      <td className="py-3 px-4">
                        <Badge className={getCategoryColor(food.category)}>
                          {food.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{food.calories}</td>
                      <td className="py-3 px-4 text-right">{food.protein.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{food.carbs.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{food.fat.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-semibold">{food.price.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFood(food)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(food.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{foods.length}</div>
            <p className="text-xs text-muted-foreground">Tổng thực phẩm</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {foods.reduce((sum, f) => sum + f.calories, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Tổng calo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {(foods.reduce((sum, f) => sum + f.price, 0) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">Tổng giá</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(foods.map(f => f.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Danh mục</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
