'use client';

import { Layers } from 'lucide-react';
import { NutritionProfilesTable } from '@/components/admin/nutrition-profiles-table';

export default function IngredientsPage() {
  return (
    <NutritionProfilesTable
      title="Hồ sơ Dinh dưỡng"
      description="Quản lý hồ sơ dinh dưỡng cho các nhóm tuổi, giới tính và tình trạng sinh lý khác nhau cùng với các khuyến cáo chi tiết"
      icon={<Layers className="h-6 w-6" />}
    />
  );
}
