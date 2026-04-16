'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, TrendingDown, AlertCircle } from 'lucide-react';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  store: string;
  checked: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface BudgetPlan {
  totalBudget: number;
  spent: number;
  remaining: number;
  recommendations: string[];
}

export function SmartShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudget] = useState(500);
  const [showOptimization, setShowOptimization] = useState(false);

  const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remaining = budget - totalCost;
  const checkedItems = items.filter(i => i.checked);

  const handleToggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const getOptimizedPlan = (): BudgetPlan => {
    const highPriority = items.filter(i => i.priority === 'high');
    const mediumPriority = items.filter(i => i.priority === 'medium');
    
    let spent = 0;
    const recommendations = [];

    // Tính toán tối ưu
    const highCost = highPriority.reduce((sum, i) => sum + i.price, 0);
    if (highCost > budget) {
      recommendations.push('⚠️ Các mục ưu tiên cao vượt quá ngân sách');
    } else {
      spent = highCost;
      const remainingBudget = budget - spent;
      const mediumCost = mediumPriority.reduce((sum, i) => sum + i.price, 0);
      
      if (mediumCost <= remainingBudget) {
        spent += mediumCost;
        recommendations.push('✓ Có thể mua tất cả các mục ưu tiên cao và trung bình');
      } else {
        recommendations.push('💡 Chỉ có thể mua một số mục ưu tiên trung bình');
      }
    }

    return {
      totalBudget: budget,
      spent,
      remaining: budget - spent,
      recommendations,
    };
  };

  const plan = getOptimizedPlan();

  return (
    <div className="space-y-6">
      {/* Budget Input */}
      <Card>
        <CardHeader>
          <CardTitle>Ngân sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="Nhập ngân sách"
              className="flex-1"
            />
            <span className="text-2xl font-bold text-primary">{budget}k</span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Tổng ngân sách</p>
            <p className="text-2xl font-bold text-primary">{budget}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Tổng chi phí</p>
            <p className="text-2xl font-bold text-orange-600">{totalCost}k</p>
          </CardContent>
        </Card>
        <Card className={remaining >= 0 ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Còn lại</p>
            <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {remaining}k
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shopping List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách mua sắm</CardTitle>
          <CardDescription>Chọn các mục cần mua</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => handleToggleItem(item.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{item.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'Trung' : 'Thấp'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.category} • {item.store}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className="w-12 text-center"
                />
                <p className="font-bold text-primary min-w-12 text-right">{item.price * item.quantity}k</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optimization */}
      <Button
        onClick={() => setShowOptimization(!showOptimization)}
        variant="outline"
        className="w-full"
      >
        <TrendingDown className="h-4 w-4 mr-2" />
        {showOptimization ? 'Ẩn' : 'Hiển thị'} Tối ưu hóa
      </Button>

      {showOptimization && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Gợi ý tối ưu hóa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.recommendations.map((rec, idx) => (
              <p key={idx} className="text-sm text-blue-900 dark:text-blue-200">
                {rec}
              </p>
            ))}
            <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Có thể chi: {plan.spent}k / {plan.totalBudget}k
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checked Items Summary */}
      {checkedItems.length > 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
              ✓ Đã chọn {checkedItems.length} mục
            </p>
            <p className="text-xs text-green-800 dark:text-green-300">
              Tổng: {checkedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)}k
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
