'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, ShoppingCart } from 'lucide-react';

interface FoodRecommendation {
  id: string;
  name: string;
  category: string;
  benefits: string[];
  icon: string;
  milkScore: number;
}

interface NearbyStore {
  id: string;
  name: string;
  distance: number;
  rating: number;
  hasItem: boolean;
}

const recommendations: FoodRecommendation[] = [
  {
    id: '1',
    name: 'Cá hồi',
    category: 'Protein',
    benefits: ['Omega-3', 'Tăng sữa', 'Chất lượng sữa cao'],
    icon: '🐟',
    milkScore: 95,
  },
  {
    id: '2',
    name: 'Trứng',
    category: 'Protein',
    benefits: ['Protein đầy đủ', 'Choline', 'Dễ nấu'],
    icon: '🥚',
    milkScore: 85,
  },
  {
    id: '3',
    name: 'Rau xanh',
    category: 'Rau',
    benefits: ['Vitamin', 'Chất xơ', 'Canxi'],
    icon: '🥬',
    milkScore: 80,
  },
  {
    id: '4',
    name: 'Hạnh nhân',
    category: 'Hạt',
    benefits: ['Canxi', 'Galactagogue', 'Chất béo lành'],
    icon: '🌰',
    milkScore: 90,
  },
  {
    id: '5',
    name: 'Sữa',
    category: 'Sữa',
    benefits: ['Canxi', 'Vitamin D', 'Tăng sữa'],
    icon: '🥛',
    milkScore: 88,
  },
  {
    id: '6',
    name: 'Yến mạch',
    category: 'Ngũ cốc',
    benefits: ['Galactagogue', 'Chất xơ', 'Năng lượng'],
    icon: '🌾',
    milkScore: 92,
  },
];

const nearbyStores: NearbyStore[] = [
  { id: '1', name: 'BigC Thảo Điền', distance: 0.8, rating: 4.5, hasItem: true },
  { id: '2', name: 'Coop Mart Quận 2', distance: 1.2, rating: 4.3, hasItem: true },
  { id: '3', name: 'Chợ Thảo Điền', distance: 0.5, rating: 4.2, hasItem: true },
];

export function NutritionRecommendations() {
  const [selectedFood, setSelectedFood] = useState<FoodRecommendation | null>(null);

  return (
    <div className="space-y-6">
      {!selectedFood ? (
        <>
          {/* Daily Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Gợi ý hôm nay</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((food) => (
                <Card
                  key={food.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedFood(food)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{food.icon}</div>
                      <div className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs font-semibold text-green-700 dark:text-green-300">
                        {food.milkScore}%
                      </div>
                    </div>
                    <h4 className="font-semibold mb-1">{food.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{food.category}</p>
                    <div className="space-y-1">
                      {food.benefits.slice(0, 2).map((benefit, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          • {benefit}
                        </p>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFood(food);
                      }}
                    >
                      Xem cửa hàng
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Nutrition Tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                💡 <strong>Lời khuyên:</strong> Ăn đa dạng các loại thực phẩm để cung cấp đủ chất dinh dưỡng cho sữa mẹ
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => setSelectedFood(null)}
            className="mb-4"
          >
            ← Quay lại
          </Button>

          {/* Food Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl mb-2">{selectedFood.icon}</div>
                  <CardTitle>{selectedFood.name}</CardTitle>
                  <CardDescription>{selectedFood.category}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Lợi sữa</p>
                  <p className="text-3xl font-bold text-green-600">{selectedFood.milkScore}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div>
                <h4 className="font-semibold mb-3">Lợi ích</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedFood.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <Heart className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Stores */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Cửa hàng gần đó
                </h4>
                <div className="space-y-2">
                  {nearbyStores.map((store) => (
                    <Card key={store.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{store.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {store.distance} km • ⭐ {store.rating}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Mua
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Cooking Tips */}
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    👨‍🍳 <strong>Mẹo nấu:</strong> Nên nấu chín kỹ, tránh để quá lâu để giữ dinh dưỡng
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
