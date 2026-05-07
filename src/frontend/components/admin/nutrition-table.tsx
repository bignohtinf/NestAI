'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, Search, Soup, Carrot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddFoodForm } from '@/components/admin/add-food-form';
import { adminApi } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface Food {
  stt: number;
  dish_name_vi: string;
  dish_type: string;
  energy: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  price_vnd: number;
  id?: string;
  dish_id?: string;
  group_name_vi?: string;
}

interface NutritionTableProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  dishType?: string; // Optional filter by type
}

export function NutritionTable({ title, description, icon, dishType }: NutritionTableProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20;

  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      
      const res = await adminApi.getNutritionDatabase({
        limit,
        offset,
        search: activeSearch,
        dishType: dishType
      });
      
      setFoods(res.foods || []);
      setTotalItems(res.total || 0);
    } catch (error) {
      console.error('Failed to fetch nutrition database:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch, limit, dishType]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const confirmDelete = async () => {
    if (foodToDelete === null) return;
    
    try {
      await adminApi.deleteNutritionItem(foodToDelete);
      setFoodToDelete(null);
      fetchFoods();
    } catch (error) {
      console.error('Failed to delete food:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    const catLower = category.toLowerCase();
    
    if (catLower.includes('rau')) return 'bg-green-100 text-green-800';
    if (catLower.includes('trái cây') || catLower.includes('ngọt')) return 'bg-red-100 text-red-800';
    if (catLower.includes('thịt') || catLower.includes('cá') || catLower.includes('mặn')) return 'bg-blue-100 text-blue-800';
    if (catLower.includes('sữa')) return 'bg-yellow-100 text-yellow-800';
    if (catLower.includes('tinh bột') || catLower.includes('cơm')) return 'bg-amber-100 text-amber-800';
    
    return 'bg-purple-100 text-purple-800';
  };

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <div className="space-y-6">
      <Dialog open={showForm && !selectedFood} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white dark:bg-gray-950 shadow-2xl">
          <AddFoodForm
            onSuccess={() => {
              setShowForm(false);
              fetchFoods();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white dark:bg-gray-950 shadow-2xl">
          {selectedFood && (
            <AddFoodForm
              initialData={selectedFood}
              onSuccess={() => {
                setSelectedFood(null);
                fetchFoods();
              }}
              onCancel={() => setSelectedFood(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={foodToDelete !== null} onOpenChange={(open) => !open && setFoodToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thực phẩm sẽ bị xóa khỏi cơ sở dữ liệu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-500">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-rose-500 hover:bg-rose-600 shrink-0">
          <Plus className="h-4 w-4" />
          Thêm thực phẩm
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          />
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">STT</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tên Món</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Danh mục</th>
                  <th className="py-3 px-4 font-semibold text-right text-gray-700 dark:text-gray-300">Calo</th>
                  <th className="py-3 px-4 font-semibold text-right text-gray-700 dark:text-gray-300">Protein</th>
                  <th className="py-3 px-4 font-semibold text-right text-gray-700 dark:text-gray-300">Carbs</th>
                  <th className="py-3 px-4 font-semibold text-right text-gray-700 dark:text-gray-300">Fat</th>
                  <th className="py-3 px-4 font-semibold text-right text-gray-700 dark:text-gray-300">Giá</th>
                  <th className="py-3 px-4 font-semibold text-center text-gray-700 dark:text-gray-300">Sửa/Xóa</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-rose-500" />
                    </td>
                  </tr>
                ) : foods.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      Không có dữ liệu thực phẩm.
                    </td>
                  </tr>
                ) : (
                  foods.map((food) => (
                    <tr key={food.stt} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-4 text-gray-500">#{food.stt}</td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{food.dish_name_vi}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`${getCategoryColor(food.dish_type)} border-none font-normal`}>
                          {food.dish_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600 font-medium">{Math.round(food.energy)}</td>
                      <td className="py-3 px-4 text-right">{food.protein.toFixed(1)}g</td>
                      <td className="py-3 px-4 text-right">{food.carbohydrate.toFixed(1)}g</td>
                      <td className="py-3 px-4 text-right">{food.fat.toFixed(1)}g</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {food.price_vnd ? `${food.price_vnd.toLocaleString()}đ` : '---'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedFood(food)}
                            className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFoodToDelete(food.stt)}
                            className="h-8 w-8 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Hiển thị {(page - 1) * limit + 1}-{Math.min(page * limit, totalItems)} / {totalItems} thực phẩm
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Trang {page} / {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
