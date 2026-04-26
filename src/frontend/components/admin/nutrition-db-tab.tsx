'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddFoodForm } from '@/components/admin/add-food-form';
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

// Match backend returned schema from nutrition_database
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
  calcium?: number;
  iron?: number;
  zinc?: number;
  vitamin_a?: number;
  vitamin_c?: number;
  sodium?: number;
}

export function NutritionDbTab() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20;

  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchInput);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const searchParam = activeSearch ? `&search=${encodeURIComponent(activeSearch)}` : '';
      
      const response = await fetch(`http://localhost:8000/api/admin/nutrition-database?limit=${limit}&offset=${offset}${searchParam}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      setFoods(data.foods || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch nutrition database:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch, limit]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const confirmDelete = async () => {
    if (foodToDelete === null) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/nutrition-database/${foodToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setFoodToDelete(null);
      // Re-fetch to ensure pagination remains consistent
      fetchFoods();
    } catch (error) {
      console.error('Failed to delete food:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    const catLower = category.toLowerCase();
    
    if (catLower.includes('rau') || catLower.includes('vegetable')) return 'bg-green-100 text-green-800';
    if (catLower.includes('trái cây') || catLower.includes('fruit')) return 'bg-red-100 text-red-800';
    if (catLower.includes('thịt') || catLower.includes('cá') || catLower.includes('protein')) return 'bg-blue-100 text-blue-800';
    if (catLower.includes('sữa') || catLower.includes('dairy')) return 'bg-yellow-100 text-yellow-800';
    if (catLower.includes('cơm') || catLower.includes('cháo') || catLower.includes('bún')) return 'bg-amber-100 text-amber-800';
    
    return 'bg-purple-100 text-purple-800';
  };

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Add Form Dialog */}
      <Dialog open={showForm && !selectedFood} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
          <AddFoodForm
            onSuccess={() => {
              setShowForm(false);
              fetchFoods();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Form Dialog */}
      <Dialog open={!!selectedFood} onOpenChange={(open) => !open && setSelectedFood(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
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

      {/* Delete Confirmation Dialog */}
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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thực phẩm theo tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Foods Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách thực phẩm</CardTitle>
          <CardDescription>
            Đang hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)} trong tổng số {totalItems} thực phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : foods.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {activeSearch ? 'Không tìm thấy thực phẩm phù hợp với từ khóa.' : 'Chưa có thực phẩm nào. Hãy thêm thực phẩm mới.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 font-semibold">STT</th>
                      <th className="text-left py-3 px-4 font-semibold">Tên Món</th>
                      <th className="text-left py-3 px-4 font-semibold">Danh mục</th>
                      <th className="text-right py-3 px-4 font-semibold">Calo (kcal)</th>
                      <th className="text-right py-3 px-4 font-semibold">Protein (g)</th>
                      <th className="text-right py-3 px-4 font-semibold">Carbs (g)</th>
                      <th className="text-right py-3 px-4 font-semibold">Fat (g)</th>
                      <th className="text-right py-3 px-4 font-semibold">Giá tham khảo</th>
                      <th className="text-center py-3 px-4 font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food) => (
                      <tr key={food.stt} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground">#{food.stt}</td>
                        <td className="py-3 px-4 font-medium">{food.dish_name_vi || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="default" className={getCategoryColor(food.dish_type)}>
                            {food.dish_type || 'Khác'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600 font-medium">{Math.round(food.energy || 0)}</td>
                        <td className="py-3 px-4 text-right">{(food.protein || 0).toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{(food.carbohydrate || 0).toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{(food.fat || 0).toFixed(1)}</td>
                        <td className="py-3 px-4 text-right font-semibold">{(food.price_vnd || 0).toLocaleString('vi-VN')}đ</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setShowForm(false); setSelectedFood(food); }}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFoodToDelete(food.stt)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
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

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-xs text-muted-foreground">
                  Trang {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Trước
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="gap-1"
                  >
                    Sau <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
