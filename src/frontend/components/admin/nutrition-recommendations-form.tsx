'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';

interface NutritionRecommendationsFormProps {
  profileStt: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface RecommendationInput {
  nutrient_name: string;
  unit: string;
  value_str: string;
}

export function NutritionRecommendationsForm({ profileStt, onSuccess, onCancel }: NutritionRecommendationsFormProps) {
  const [formData, setFormData] = useState<RecommendationInput>({
    nutrient_name: '',
    unit: '',
    value_str: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof RecommendationInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nutrient_name.trim()) {
      setError('Tên nutrient là bắt buộc');
      return;
    }

    if (!formData.value_str.trim()) {
      setError('Giá trị là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      await adminApi.saveNutritionRecommendation({
        profile_stt: profileStt,
        nutrient_name: formData.nutrient_name.trim(),
        unit: formData.unit || null,
        value_str: formData.value_str.trim(),
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu khuyến cáo');
      console.error('Error saving recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-2xl">Thêm Khuyến cáo Dinh dưỡng</CardTitle>
          <CardDescription>Thêm khuyến cáo cho Profile #{profileStt}</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nutrient_name" className="text-gray-700 dark:text-gray-300 font-medium">
                Tên Nutrient *
              </Label>
              <Input
                id="nutrient_name"
                type="text"
                value={formData.nutrient_name}
                onChange={(e) => handleChange('nutrient_name', e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                placeholder="Ví dụ: Calories, Protein, Calcium"
              />
              <p className="text-xs text-gray-500">Tên dinh dưỡng (ví dụ: Calories, Protein, Calcium, v.v.)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value_str" className="text-gray-700 dark:text-gray-300 font-medium">
                  Giá trị *
                </Label>
                <Input
                  id="value_str"
                  type="text"
                  value={formData.value_str}
                  onChange={(e) => handleChange('value_str', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  placeholder="Ví dụ: 2000, 50-100"
                />
                <p className="text-xs text-gray-500">Giá trị khuyến cáo (có thể là số hoặc dãy)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-gray-700 dark:text-gray-300 font-medium">
                  Đơn vị
                </Label>
                <Input
                  id="unit"
                  type="text"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  placeholder="Ví dụ: kcal, g, mg, IU"
                />
                <p className="text-xs text-gray-500">Đơn vị đo lường</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-semibold">Thông tin:</span> Khuyến cáo này sẽ được liên kết với Profile STT {profileStt}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="border-gray-200 dark:border-gray-800"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-rose-500 hover:bg-rose-600 gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Thêm Khuyến cáo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
