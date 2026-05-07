'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';

interface NutritionProfile {
  id?: string;
  stt?: number;
  age_group?: string;
  gender?: string;
  labor_level?: string;
  physiological_condition?: string;
  created_at?: string;
}

interface NutritionProfileFormProps {
  initialData?: NutritionProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NutritionProfileForm({ initialData, onSuccess, onCancel }: NutritionProfileFormProps) {
  const [formData, setFormData] = useState<NutritionProfile>(
    initialData || {
      stt: 0,
      age_group: '',
      gender: '',
      labor_level: '',
      physiological_condition: '',
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData?.stt;

  const handleChange = (field: keyof NutritionProfile, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.stt) {
      setError('STT là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      await adminApi.saveNutritionProfile(formData.stt || null, {
        stt: formData.stt,
        age_group: formData.age_group || null,
        gender: formData.gender || null,
        labor_level: formData.labor_level || null,
        physiological_condition: formData.physiological_condition || null,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu profile');
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-2xl">{isEditing ? 'Chỉnh sửa' : 'Thêm mới'} Nutrition Profile</CardTitle>
          <CardDescription>Quản lý hồ sơ dinh dưỡng cho các nhóm người</CardDescription>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stt" className="text-gray-700 dark:text-gray-300 font-medium">
                STT *
              </Label>
              <Input
                id="stt"
                type="number"
                value={formData.stt}
                onChange={(e) => handleChange('stt', parseInt(e.target.value) || 0)}
                disabled={isEditing}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                placeholder="Ví dụ: 1"
              />
              <p className="text-xs text-gray-500">Mã định danh duy nhất cho profile</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age_group" className="text-gray-700 dark:text-gray-300 font-medium">
                Độ tuổi
              </Label>
              <Input
                id="age_group"
                type="text"
                value={formData.age_group || ''}
                onChange={(e) => handleChange('age_group', e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                placeholder="Ví dụ: 18-25 tuổi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300 font-medium">
                Giới tính
              </Label>
              <Input
                id="gender"
                type="text"
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                placeholder="Ví dụ: Nữ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor_level" className="text-gray-700 dark:text-gray-300 font-medium">
                Mức lao động
              </Label>
              <Input
                id="labor_level"
                type="text"
                value={formData.labor_level || ''}
                onChange={(e) => handleChange('labor_level', e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                placeholder="Ví dụ: Nhẹ"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="physiological_condition" className="text-gray-700 dark:text-gray-300 font-medium">
                Tình trạng sinh lý
              </Label>
              <Input
                id="physiological_condition"
                type="text"
                value={formData.physiological_condition || ''}
                onChange={(e) => handleChange('physiological_condition', e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                placeholder="Ví dụ: Bà bầu"
              />
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
              {isEditing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
