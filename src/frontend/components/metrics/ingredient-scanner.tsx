'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Lightbulb } from 'lucide-react';

interface DetectedIngredient {
  name: string;
  confidence: number;
}

interface RecipeSuggestion {
  name: string;
  ingredients: string[];
  time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  matchPercentage: number;
}

const mockRecipes: RecipeSuggestion[] = [
  {
    name: 'Cá hồi nướng với rau xanh',
    ingredients: ['Cá hồi', 'Rau xanh', 'Dầu olive', 'Chanh'],
    time: 30,
    difficulty: 'easy',
    matchPercentage: 100,
  },
  {
    name: 'Salad cá hồi',
    ingredients: ['Cá hồi', 'Rau xanh', 'Cà chua', 'Dầu olive'],
    time: 15,
    difficulty: 'easy',
    matchPercentage: 80,
  },
  {
    name: 'Cơm chiên với rau',
    ingredients: ['Cơm', 'Rau xanh', 'Trứng', 'Dầu ăn'],
    time: 20,
    difficulty: 'easy',
    matchPercentage: 60,
  },
];

export function IngredientScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      analyzeIngredients();
    };
    reader.readAsDataURL(file);
  };

  const analyzeIngredients = async () => {
    setLoading(true);
    // Simulate AI analysis
    setTimeout(() => {
      const mockDetected: DetectedIngredient[] = [
        { name: 'Cá hồi', confidence: 95 },
        { name: 'Rau xanh', confidence: 88 },
        { name: 'Dầu olive', confidence: 75 },
      ];
      setDetectedIngredients(mockDetected);

      // Filter recipes based on detected ingredients
      const filtered = mockRecipes.filter(recipe => {
        const matchCount = recipe.ingredients.filter(ing =>
          mockDetected.some(det => det.name.toLowerCase().includes(ing.toLowerCase()))
        ).length;
        return matchCount > 0;
      }).sort((a, b) => b.matchPercentage - a.matchPercentage);

      setSuggestions(filtered);
      setLoading(false);
    }, 1500);
  };

  const resetScan = () => {
    setImage(null);
    setDetectedIngredients([]);
    setSuggestions([]);
  };

  return (
    <div className="space-y-6">
      {!image ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Button */}
          <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center gap-3 py-8"
              >
                <Camera className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Chụp ảnh</p>
                  <p className="text-sm text-muted-foreground">Chụp ảnh nguyên liệu</p>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Upload Button */}
          <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center gap-3 py-8"
              >
                <Upload className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Tải ảnh lên</p>
                  <p className="text-sm text-muted-foreground">Chọn từ thư viện</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <img
                  src={image}
                  alt="Ingredients preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={resetScan}
                  className="absolute top-2 right-2 bg-destructive text-white p-2 rounded-full hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Detected Ingredients */}
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-muted-foreground">Đang phân tích nguyên liệu...</p>
              </CardContent>
            </Card>
          ) : detectedIngredients.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Nguyên liệu phát hiện</CardTitle>
                  <CardDescription>AI đã nhận diện được các nguyên liệu sau</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detectedIngredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="font-semibold">{ing.name}</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {ing.confidence}% chắc chắn
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recipe Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Gợi ý món ăn
                  </CardTitle>
                  <CardDescription>Dựa trên nguyên liệu bạn có</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestions.length > 0 ? (
                    suggestions.map((recipe, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{recipe.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {recipe.time} phút • {recipe.difficulty === 'easy' ? 'Dễ' : recipe.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {recipe.matchPercentage}% phù hợp
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients.map((ing, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Không tìm thấy gợi ý phù hợp
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 Mẹo: Chụp ảnh rõ ràng các nguyên liệu để AI nhận diện chính xác nhất
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
