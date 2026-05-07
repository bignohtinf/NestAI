'use client';

import { Soup } from 'lucide-react';
import { NutritionTable } from '@/components/admin/nutrition-table';

export default function DishesPage() {
  return (
    <NutritionTable 
      title="Danh mục Món ăn"
      description="Quản lý các món ăn đã chế biến và thông tin dinh dưỡng kèm theo"
      icon={<Soup className="h-6 w-6" />}
      // We can filter for things that are NOT ingredients, or just show all but label it dishes
      // In the DB, dish_type is one of ["món mặn", "món rau", "món tinh bột", "món canh", "tráng miệng"]
      // We can pass a specific type if needed, but for dishes page we usually want all cooked types.
    />
  );
}
