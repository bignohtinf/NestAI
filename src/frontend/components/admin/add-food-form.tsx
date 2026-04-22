'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';

interface AddFoodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = ['vegetable', 'fruit', 'protein', 'dairy', 'grain', 'supplement'];

export function AddFoodForm({ onSuccess, onCancel }: AddFoodFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    price: '',
    category: 'vegetable',
    serving_size: '100',
    unit: 'g',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams({
        name: formData.name,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        fiber: formData.fiber,
        price: formData.price,
        category: formData.category,
        serving_size: formData.serving_size,
        unit: formData.unit,
      });

      const response = await fetch(`http://localhost:8000/api/admin/nutrition-database?${params}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to add food');
      
      setFormData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        price: '',
        category: 'vegetable',
        serving_size: '100',
        unit: 'g',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to add food:', error);
      alert('Lỗi khi thêm thực phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Thêm thực phẩm mới</CardTitle>
          <CardDescription>Nhập thông tin dinh dưỡng của thực phẩm</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="text-sm font-medium">Tên thực phẩm *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Cà chua"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Danh mục *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Calories */}
            <div>
              <label className="text-sm font-medium">Calo *</label>
              <Input
                name="calories"
                type="number"
                value={formData.calories}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            {/* Protein */}
            <div>
              <label className="text-sm font-medium">Protein (g) *</label>
              <Input
                name="protein"
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            {/* Carbs */}
            <div>
              <label className="text-sm font-medium">Carbs (g) *</label>
              <Input
                name="carbs"
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            {/* Fat */}
            <div>
              <label className="text-sm font-medium">Fat (g) *</label>
              <Input
                name="fat"
                type="number"
                step="0.1"
                value={formData.fat}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            {/* Fiber */}
            <div>
              <label className="text-sm font-medium">Fiber (g)</label>
              <Input
                name="fiber"
                type="number"
                step="0.1"
                value={formData.fiber}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-medium">Giá (VND) *</label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            {/* Serving Size */}
            <div>
              <label className="text-sm font-medium">Khẩu phần *</label>
              <Input
                name="serving_size"
                type="number"
                step="0.1"
                value={formData.serving_size}
                onChange={handleChange}
                placeholder="100"
                required
              />
            </div>

            {/* Unit */}
            <div>
              <label className="text-sm font-medium">Đơn vị *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="g">Gram (g)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="piece">Cái</option>
                <option value="cup">Cốc</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Thêm thực phẩm
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
