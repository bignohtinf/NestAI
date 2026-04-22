'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  milkBenefit: string;
  timestamp: Date;
}

const nutritionColors = [
  { key: 'calories', label: 'Calo', unit: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { key: 'protein', label: 'Protein', unit: 'g', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { key: 'fat', label: 'Chất béo', unit: 'g', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
];

export function SmartScan() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
    setAnalysis(null);
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageUpload(file);
  };

  const handleSaveToLog = () => {
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
        <>
          {/* Main drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/8 scale-[1.01]'
                : 'border-border/60 bg-secondary/40 hover:border-primary/50 hover:bg-secondary/70'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
              <div className="relative">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging ? 'bg-primary text-white scale-110' : 'bg-primary/10 text-primary'
                }`}>
                  <Camera className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              <div>
                <p className="text-lg font-semibold text-foreground">Chụp ảnh món ăn</p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI sẽ tự động phân tích calo & dinh dưỡng
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}
                >
                  <Camera className="h-4 w-4" />
                  Chụp ảnh
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium border border-border bg-card text-foreground hover:bg-secondary transition-all"
                >
                  <Upload className="h-4 w-4" />
                  Tải lên
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Hoặc kéo &amp; thả ảnh vào đây
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <span className="font-medium">Mẹo:</span> Chụp ảnh từ trên xuống, đủ ánh sáng để AI nhận diện chính xác nhất.
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-card">
            <img
              src={image}
              alt="Ảnh món ăn"
              className="w-full h-64 sm:h-72 object-cover"
            />
            <button
              onClick={resetScan}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full px-3 py-1">
              Đang xem trước ảnh
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Đang phân tích ảnh...</p>
              <p className="text-xs text-muted-foreground mt-1">AI đang nhận diện thức ăn</p>
            </div>
          )}

          {/* Analysis Result */}
          {!loading && analysis && (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-card">
              <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{analysis.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Phân tích dinh dưỡng</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">AI</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Nutrition Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {nutritionColors.map((n) => (
                    <div key={n.key} className={`${n.bg} border ${n.border} rounded-xl p-3 text-center`}>
                      <p className="text-xs text-muted-foreground mb-1">{n.label}</p>
                      <p className={`text-xl font-bold ${n.color}`}>
                        {(analysis as any)[n.key]}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.unit}</p>
                    </div>
                  ))}
                </div>

                {/* Milk Benefit */}
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                  <span className="text-xl">🌿</span>
                  <div>
                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Lợi ích cho sữa mẹ</p>
                    <p className="text-sm text-emerald-900 mt-0.5">{analysis.milkBenefit}</p>
                  </div>
                </div>

                <Button onClick={handleSaveToLog} className="w-full rounded-xl h-11">
                  <Check className="h-4 w-4 mr-2" />
                  Lưu vào nhật ký dinh dưỡng
                </Button>
              </div>
            </div>
          )}

          {/* No result yet (image uploaded but no analysis) */}
          {!loading && !analysis && (
            <div className="rounded-2xl border border-border/50 bg-card p-6 text-center">
              <p className="text-muted-foreground text-sm">Ảnh đã tải lên — tính năng phân tích AI đang được triển khai.</p>
              <button
                onClick={resetScan}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Thử ảnh khác
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
