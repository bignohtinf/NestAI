'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Zap, Info, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { nutritionApi } from '@/lib/api';

interface DishAnalysis {
  name: string;
  confidence: number;
  estimated_grams: number;
  matched_food: {
    dish_name_vi?: string;
    dish_name_en?: string;
    dish_type?: string;
  } | null;
  match_score: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  iron?: number | null;
  calcium?: number | null;
  pregnancy_benefit: string;
  portion_multiplier: number;
}

interface SmartScanResponse {
  dishes: DishAnalysis[];
  meal_context: string | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  suggestions: string[];
  pregnancy_guidance?: string | null;
}

interface SmartScanProps {
  /** Khi true: upload bên trái, kết quả bên phải — dùng cho trang scan full-width */
  splitLayout?: boolean;
}

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function SmartScan({ splitLayout = false }: SmartScanProps) {
  const { user } = useApp();
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SmartScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'notified'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      analyzeFood(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async (imageData?: string) => {
    setLoading(true);
    setAnalysis(null);
    setError(null);
    try {
      const response = await fetch(`${BASE_API_URL}/api/nutrition/analyze-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, user_id: user?.id }),
      });

      // Read body once as text, then parse — avoids double-read bug
      const bodyText = await response.text();

      if (!response.ok) {
        let message = 'Không thể phân tích ảnh';
        try {
          const errorJson = JSON.parse(bodyText);
          const detail = errorJson?.detail;
          if (typeof detail === 'string' && detail.trim()) {
            message = detail.includes('model_not_found') || (detail.includes('model') && detail.includes('not found'))
              ? 'Cấu hình AI vision chưa hợp lệ trên server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.'
              : detail;
          } else if (bodyText) {
            message = bodyText;
          }
        } catch {
          if (bodyText) message = bodyText;
        }
        throw new Error(message);
      }

      const data = JSON.parse(bodyText) as SmartScanResponse;
      setAnalysis(data);
    } catch (err) {
      console.error('[SmartScan] analyzeFood error:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLog = async () => {
    if (!analysis || !user?.id) return;
    try {
      setLoading(true);
      setSaveStatus('idle');

      const mealName = analysis.dishes.map((d) => d.matched_food?.dish_name_vi || d.name).join(', ');

      // Cả mẹ lẫn bố đều đi qua scan-food-notify endpoint
      // → lưu cả nutrition_logs + food_scan_logs (giữ iron/calcium)
      // → mẹ có partnership thì tự gửi notification cho bố, bố thì skip notification
      const result = await nutritionApi.saveScanFood(user.id, {
        meal_name: mealName,
        total_calories: analysis.total_calories,
        total_protein: analysis.total_protein,
        total_carbs: analysis.total_carbs,
        total_fat: analysis.total_fat,
        dishes: analysis.dishes,
        pregnancy_guidance: analysis.pregnancy_guidance ?? null,
        meal_context: analysis.meal_context ?? null,
      });
      if (!result.success && !result.skipped) {
        throw new Error('Không thể lưu nhật ký');
      }
      setSaveStatus(result.skipped ? 'saved' : 'notified');

      // Thông báo cho MomDashboard và các component khác cập nhật dinh dưỡng
      window.dispatchEvent(new CustomEvent('nutritionLogSaved'));

      // Reset sau 1.5s để user thấy trạng thái
      setTimeout(() => {
        resetScan();
        setSaveStatus('idle');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu nhật ký');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageUpload(file);
  };

  const resetScan = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
  };

  // ─── Shared sub-components ───────────────────────────────────────────

  /** Vùng upload drag-and-drop */
  const UploadZone = () => (
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
          <p className="text-lg font-semibold text-foreground">Chụp ảnh bữa ăn</p>
          <p className="text-sm text-muted-foreground mt-1">AI tự động tính calo và vi chất — không cần nhập tay</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" />
          <button onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}>
            <Camera className="h-4 w-4" /> Chụp ảnh
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium border border-border bg-card text-foreground hover:bg-secondary transition-all">
            <Upload className="h-4 w-4" /> Tải lên
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Hoặc kéo &amp; thả ảnh vào đây</p>
      </div>
    </div>
  );

  /** Tip card phía dưới upload zone */
  const TipCard = () => (
    <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
      <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800">
        <span className="font-medium">Mẹo:</span> Chụp từ trên xuống, đủ ánh sáng, cả đĩa trong khung hình để AI nhận diện chính xác nhất.
      </p>
    </div>
  );

  /** Preview ảnh đã upload */
  const ImagePreview = () => (
    <div className="relative rounded-2xl overflow-hidden shadow-card">
      <img src={image!} alt="Ảnh bữa ăn" className={`w-full object-cover ${splitLayout ? 'h-72 lg:h-96' : 'h-64 sm:h-72'}`} />
      <button onClick={resetScan}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur-sm"
        aria-label="Xóa ảnh">
        <X className="h-4 w-4" />
      </button>
      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full px-3 py-1">
        Đang xem trước ảnh
      </div>
    </div>
  );

  // ─── Kết quả phân tích (JSX thuần — không dùng sub-component để tránh
  //     React unmount/remount mỗi lần re-render khi state thay đổi)
  const resultsPanel = (
    <>
      {loading && (
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Đang phân tích ảnh...</p>
          <p className="text-xs text-muted-foreground mt-1">AI đang nhận diện thức ăn Việt Nam</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">Không thể phân tích ảnh</p>
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={resetScan} className="mt-3 text-sm text-primary hover:underline">Thử lại</button>
        </div>
      )}

      {!loading && analysis && (
        <div className="space-y-4">
          {/* Tổng dinh dưỡng */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-card">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {analysis.dishes.length} món — {analysis.meal_context || 'Bữa ăn'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tổng dinh dưỡng cả bữa</p>
              </div>
              <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">AI</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'total_calories', label: 'Calo',      unit: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                  { key: 'total_protein',  label: 'Protein',   unit: 'g',    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
                  { key: 'total_carbs',    label: 'Carbs',     unit: 'g',    color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100'  },
                  { key: 'total_fat',      label: 'Chất béo',  unit: 'g',    color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100'},
                ].map((n) => (
                  <div key={n.key} className={`${n.bg} border ${n.border} rounded-xl p-3 text-center`}>
                    <p className="text-xs text-muted-foreground mb-1">{n.label}</p>
                    <p className={`text-xl font-bold ${n.color}`}>{(analysis as any)[n.key]}</p>
                    <p className="text-xs text-muted-foreground">{n.unit}</p>
                  </div>
                ))}
              </div>

              {/* Vi chất: Sắt & Canxi */}
              {(() => {
                const totalIron = analysis.dishes.reduce((s, d) => s + (d.iron ?? 0), 0);
                const totalCalcium = analysis.dishes.reduce((s, d) => s + (d.calcium ?? 0), 0);
                return (totalIron > 0 || totalCalcium > 0) ? (
                  <div className="grid grid-cols-2 gap-3">
                    {totalIron > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">🩸 Sắt</p>
                        <p className="text-lg font-bold text-red-600">{Math.round(totalIron * 10) / 10}</p>
                        <p className="text-xs text-muted-foreground">mg</p>
                      </div>
                    )}
                    {totalCalcium > 0 && (
                      <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">🥛 Canxi</p>
                        <p className="text-lg font-bold text-sky-600">{Math.round(totalCalcium)}</p>
                        <p className="text-xs text-muted-foreground">mg</p>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              {analysis.pregnancy_guidance && (
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                  <span className="text-xl shrink-0">🤰</span>
                  <div>
                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Nhận xét thai kỳ</p>
                    <p className="text-sm text-emerald-900 mt-0.5">{analysis.pregnancy_guidance}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveToLog}
                disabled={loading || saveStatus !== 'idle'}
                className={`w-full rounded-xl h-11 transition-all ${
                  saveStatus === 'notified'
                    ? 'bg-emerald-600 hover:bg-emerald-600'
                    : saveStatus === 'saved'
                    ? 'bg-blue-600 hover:bg-blue-600'
                    : ''
                }`}
              >
                {saveStatus === 'notified' ? (
                  <><Send className="h-4 w-4 mr-2" />Đã lưu &amp; thông báo cho bố!</>
                ) : saveStatus === 'saved' ? (
                  <><Check className="h-4 w-4 mr-2" />Đã lưu nhật ký!</>
                ) : (
                  <><Check className="h-4 w-4 mr-2" />Lưu vào nhật ký dinh dưỡng</>
                )}
              </Button>
            </div>
          </div>

          {/* Chi tiết từng món */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Chi tiết từng món</p>
            {analysis.dishes.map((dish, idx) => (
              <div key={idx} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{dish.matched_food?.dish_name_vi || dish.name}</p>
                      <p className="text-xs text-muted-foreground">{dish.estimated_grams}g</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-orange-600 shrink-0 ml-2">{dish.calories} kcal</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Protein', value: dish.protein, unit: 'g', color: 'text-blue-600' },
                    { label: 'Carbs',   value: dish.carbs,   unit: 'g', color: 'text-amber-600' },
                    { label: 'Béo',     value: dish.fat,     unit: 'g', color: 'text-emerald-600' },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <p className={`text-sm font-semibold ${m.color}`}>{m.value}{m.unit}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
                {(dish.iron || dish.calcium) && (
                  <div className="px-4 pb-2 flex gap-3">
                    {dish.iron ? (
                      <span className="text-xs text-red-600 bg-red-50 rounded-md px-2 py-1">🩸 Sắt {Math.round(dish.iron * 10) / 10}mg</span>
                    ) : null}
                    {dish.calcium ? (
                      <span className="text-xs text-sky-600 bg-sky-50 rounded-md px-2 py-1">🥛 Canxi {Math.round(dish.calcium)}mg</span>
                    ) : null}
                  </div>
                )}
                {dish.pregnancy_benefit && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">🤰 {dish.pregnancy_benefit}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !analysis && !error && image && (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ảnh đã tải lên thành công</p>
              <p className="text-sm text-muted-foreground mt-1">Đang chuẩn bị phân tích...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ─── Split layout (scan page — 2 cột) ───────────────────────────────
  if (splitLayout) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Cột trái: upload / preview */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {!image ? (
            <>
              <UploadZone />
              <TipCard />
            </>
          ) : (
            <>
              <ImagePreview />
              <TipCard />
            </>
          )}
        </div>

        {/* Cột phải: kết quả */}
        <div className="space-y-4">
          {!image && !loading && !analysis && (
            <div className="rounded-2xl border-2 border-dashed border-border/40 bg-secondary/20 flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Kết quả sẽ hiển thị ở đây</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Tải ảnh lên để AI bắt đầu phân tích</p>
            </div>
          )}
          {resultsPanel}
        </div>
      </div>
    );
  }

  // ─── Stacked layout (dialog trong generate page) ─────────────────────
  return (
    <div className="space-y-4">
      {!image ? (
        <>
          <UploadZone />
          <TipCard />
        </>
      ) : (
        <div className="space-y-4">
          <ImagePreview />
          {resultsPanel}
        </div>
      )}
    </div>
  );
}
