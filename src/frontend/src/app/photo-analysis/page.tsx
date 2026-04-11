'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockUser } from '@/lib/mock-data';
import { Camera, Upload, Check, X } from 'lucide-react';
import { useState } from 'react';

interface AnalyzedItem {
  name: string;
  confidence: number;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function PhotoAnalysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzedItem[] | null>(null);

  const mockAnalysisResult: AnalyzedItem[] = [
    {
      name: 'Phở Gà',
      confidence: 95,
      servingSize: '1 bát',
      calories: 350,
      protein: 28,
      carbs: 42,
      fat: 8,
    },
    {
      name: 'Rau sống',
      confidence: 88,
      servingSize: '100g',
      calories: 45,
      protein: 3,
      carbs: 8,
      fat: 0.5,
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setAnalysisResult(mockAnalysisResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const totalNutrition = analysisResult?.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Phân tích ảnh</h1>
          <p className="text-muted-foreground">Chụp ảnh món ăn để nhận dữ liệu dinh dưỡng tức thì</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Tải ảnh lên</CardTitle>
              <CardDescription>Chọn ảnh của bữa ăn bạn muốn phân tích</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Selected food"
                    className="w-full h-64 object-cover rounded-lg border border-border"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {isAnalyzing ? 'Đang phân tích...' : 'Phân tích'}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setAnalysisResult(null);
                      }}
                      variant="outline"
                      className="border-border"
                    >
                      Thay ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload Area */}
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="mb-2 text-sm text-foreground font-medium">
                        Nhấp để chọn ảnh hoặc kéo thả
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF (tối đa 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {/* Or Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-muted-foreground">hoặc</span>
                    </div>
                  </div>

                  {/* Camera Button */}
                  <Button
                    className="w-full bg-accent hover:bg-accent/90"
                    onClick={() => {
                      // In a real app, this would open the camera
                      alert('Tính năng camera sẽ được bật trên thiết bị di động');
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Chụp ảnh từ camera
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Kết quả phân tích</CardTitle>
                <CardDescription>Chi tiết dinh dưỡng của bữa ăn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Foods Detected */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Thực phẩm phát hiện:</h4>
                  {analysisResult.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.servingSize}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20">
                          <Check className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">{item.confidence}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Calo:</span>
                          <span className="ml-1 font-medium text-foreground">{item.calories}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Protein:</span>
                          <span className="ml-1 font-medium text-primary">{item.protein}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carbs:</span>
                          <span className="ml-1 font-medium text-sky-500">{item.carbs}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fat:</span>
                          <span className="ml-1 font-medium text-yellow-500">{item.fat}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Nutrition */}
                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Tổng dinh dưỡng:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <p className="text-xs text-muted-foreground">Calo</p>
                      <p className="text-2xl font-bold text-primary">{totalNutrition?.calories.toFixed(0)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/10">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold text-accent">{totalNutrition?.protein.toFixed(1)}g</p>
                    </div>
                    <div className="p-3 rounded-lg bg-sky-500/10">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-2xl font-bold text-sky-500">{totalNutrition?.carbs.toFixed(1)}g</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10">
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p className="text-2xl font-bold text-yellow-500">{totalNutrition?.fat.toFixed(1)}g</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => {
                    // Save to daily log
                    alert('Saved to daily log!');
                  }}>
                    Lưu vào nhật ký
                  </Button>
                  <Button variant="outline" className="border-border" onClick={() => setAnalysisResult(null)}>
                    Phân tích khác
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Lịch sử phân tích gần đây</CardTitle>
            <CardDescription>Các bữa ăn bạn đã phân tích</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Cơm Tấm Sườn', date: 'Hôm nay', time: '12:30', calories: 520 },
                { name: 'Bánh Mì Trứng', date: 'Hôm nay', time: '08:15', calories: 380 },
                { name: 'Phở Gà', date: 'Hôm qua', time: '19:00', calories: 350 },
                { name: 'Gỏi Cuốn', date: 'Hôm qua', time: '12:45', calories: 220 },
              ].map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border cursor-pointer transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{meal.name}</p>
                    <p className="text-sm text-muted-foreground">{meal.date} lúc {meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{meal.calories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
