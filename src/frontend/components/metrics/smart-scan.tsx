'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Check } from 'lucide-react';

interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  milkBenefit: string;
  timestamp: Date;
}

export function SmartScan() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      analyzeFood();
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async () => {
    setLoading(true);
    // TODO: Call API to analyze food
    // For now, just clear the analysis
    setAnalysis(null);
    setLoading(false);
  };

  const handleSaveToLog = () => {
    // TODO: Save to nutrition log
    alert('Đã lưu vào nhật ký dinh dưỡng!');
    resetScan();
  };

  const resetScan = () => {
    setImage(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-4">
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
                  <p className="text-sm text-muted-foreground">Chụp ảnh món ăn</p>
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
                  alt="Food preview"
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

          {/* Analysis Result */}
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-muted-foreground">Đang phân tích ảnh...</p>
              </CardContent>
            </Card>
          ) : analysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{analysis.name}</CardTitle>
                <CardDescription>Phân tích dinh dưỡng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nutrition Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Calo</p>
                    <p className="text-xl font-bold text-primary">{analysis.calories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-xl font-bold text-blue-600">{analysis.protein}g</p>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-xl font-bold text-yellow-600">{analysis.carbs}g</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-xl font-bold text-orange-600">{analysis.fat}g</p>
                  </div>
                </div>

                {/* Milk Benefit */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                    💚 Lợi sữa: {analysis.milkBenefit}
                  </p>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveToLog}
                  className="w-full"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Lưu vào nhật ký
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 Mẹo: Chụp ảnh rõ ràng, từ trên xuống để AI phân tích chính xác nhất
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
