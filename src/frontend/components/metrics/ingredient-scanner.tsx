'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, Upload, X, Zap, Info, AlertCircle, Check,
  History, ChevronDown, ChevronUp, RefreshCw, Loader2,
  UtensilsCrossed, Flame, Leaf, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { nutritionApi } from '@/lib/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IngredientInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimated_grams: number;
  matched_food?: { dish_name_vi?: string; dish_name_en?: string } | null;
  pregnancy_benefit?: string;
  confidence?: number;
}

interface ScanResult {
  dishes: IngredientInfo[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_context?: string | null;
  suggestions: string[];
  pregnancy_guidance?: string | null;
  recipe_suggestions?: string[];
}

interface HistoryItem {
  id: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  created_at: string;
}

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Sinh gợi ý món từ nguyên liệu ───────────────────────────────────────────
function buildRecipeSuggestions(ingredients: IngredientInfo[]): string[] {
  const names = ingredients.map(i =>
    (i.matched_food?.dish_name_vi || i.name).toLowerCase()
  );

  const recipes: string[] = [];

  const hasMeat = names.some(n => n.includes('thịt') || n.includes('heo') || n.includes('bò') || n.includes('gà'));
  const hasSeafood = names.some(n => n.includes('cá') || n.includes('tôm') || n.includes('mực') || n.includes('cua'));
  const hasVeg = names.some(n => n.includes('rau') || n.includes('cải') || n.includes('cà') || n.includes('bí') || n.includes('bắp'));
  const hasEgg = names.some(n => n.includes('trứng') || n.includes('egg'));

  if (hasMeat && hasVeg) {
    recipes.push('🍲 Canh thịt rau củ — đơn giản, bổ dưỡng');
    recipes.push('🥘 Thịt kho tàu — đậm đà, ăn cùng cơm trắng');
  }
  if (hasMeat && !hasVeg) {
    recipes.push('🥩 Thịt xào hành tỏi — nhanh gọn, thơm ngon');
    recipes.push('🫕 Súp thịt — nhẹ bụng, dễ tiêu');
  }
  if (hasSeafood) {
    recipes.push('🐟 Cá hấp gừng hành — giữ nguyên dinh dưỡng');
    recipes.push('🍜 Bún hải sản — nhẹ bụng, giàu đạm');
  }
  if (hasEgg) {
    recipes.push('🥚 Trứng chiên rau — nhanh, đủ chất');
    recipes.push('🍳 Cháo trứng — mềm, dễ ăn buổi sáng');
  }
  if (hasVeg && !hasMeat && !hasSeafood) {
    recipes.push('🥗 Rau xào tỏi — giữ vitamin, thơm ngon');
    recipes.push('🫙 Canh rau củ — thanh mát, giàu chất xơ');
  }
  if (recipes.length === 0) {
    recipes.push('🍚 Cơm thập cẩm từ nguyên liệu đã quét');
    recipes.push('🥗 Salad dinh dưỡng — trộn đều, ăn liền');
    recipes.push('🍲 Canh hầm tổng hợp — giàu khoáng chất');
  }

  return recipes.slice(0, 4);
}

// ─── Gợi ý bổ sung theo dinh dưỡng ───────────────────────────────────────────
function buildNutritionTips(item: HistoryItem): string[] {
  const tips: string[] = [];
  if (item.calories < 200) tips.push('• Thêm nguồn đạm: thịt nạc, cá, trứng, đậu phụ');
  if (item.calories >= 200 && item.calories < 500) tips.push('• Bổ sung rau xanh và trái cây tươi');
  if (item.calories >= 500) tips.push('• Hạn chế chất béo, ưu tiên rau xanh và nước lọc');
  if (item.protein < 10) tips.push('• Tăng đạm: thêm thịt nạc hoặc hải sản');
  if (item.carbs > 50) tips.push('• Cân bằng tinh bột với rau củ và đạm');
  if (item.fat > 20) tips.push('• Giảm chất béo: tránh chiên xào, ưu tiên hấp/luộc');
  if (tips.length === 0) tips.push('• Dinh dưỡng cân bằng! Duy trì thực đơn này.');
  return tips;
}

// ─── Component chính ──────────────────────────────────────────────────────────

export function IngredientScanner() {
  const { user } = useApp();

  // Scanner state
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Load lịch sử ────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!user?.id) return;
    setHistoryLoading(true);
    try {
      const data = await nutritionApi.getLogs(user.id, 20);
      const scanLogs = (data.logs || []).filter(
        l => l.source === 'father_scan' || l.source === 'scan' || l.source === 'ai_scan'
      );
      setHistory(scanLogs);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Xử lý upload ────────────────────────────────────────────────────────
  const handleImageUpload = (file: File) => {
    setError(null);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = e => {
      const img = e.target?.result as string;
      setImage(img);
      analyzeIngredients(img);
    };
    reader.readAsDataURL(file);
  };

  const analyzeIngredients = async (imageData: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${BASE_API_URL}/api/nutrition/analyze-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, user_id: user?.id }),
      });
      if (!res.ok) {
        let msg = 'Không thể phân tích ảnh';
        try {
          const j = await res.json();
          if (typeof j?.detail === 'string' && j.detail.trim()) msg = j.detail;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      const data = (await res.json()) as ScanResult;
      if (!data.recipe_suggestions || data.recipe_suggestions.length === 0) {
        data.recipe_suggestions = buildRecipeSuggestions(data.dishes || []);
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // ── Lưu log ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!result || !user?.id) return;
    setSaving(true);
    try {
      const mealName = result.dishes
        .map(d => d.matched_food?.dish_name_vi || d.name)
        .join(', ');
      // Dùng saveScanFood thay vì POST /logs trực tiếp
      // → lưu cả nutrition_logs + food_scan_logs (giữ iron/calcium)
      // → gửi notification cho partner nếu có
      await nutritionApi.saveScanFood(user.id, {
        meal_name: mealName,
        total_calories: result.total_calories,
        total_protein: result.total_protein,
        total_carbs: result.total_carbs,
        total_fat: result.total_fat,
        dishes: result.dishes,
        pregnancy_guidance: null,
        meal_context: result.meal_context ?? null,
      });
      setSaved(true);
      // Thông báo cho NutritionDashboard và các component khác cập nhật
      window.dispatchEvent(new CustomEvent('nutritionLogSaved'));
      await loadHistory();
      setTimeout(() => { resetScan(); setSaved(false); }, 1800);
    } catch {
      setError('Không thể lưu lịch sử. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleImageUpload(file);
  };

  const resetScan = () => { setImage(null); setResult(null); setError(null); };

  // ─── Sub-components ───────────────────────────────────────────────────────

  const UploadZone = () => (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
        isDragging
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10 scale-[1.01]'
          : 'border-border/60 bg-secondary/40 hover:border-green-400/60 hover:bg-secondary/70'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
        <div className="relative">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
            isDragging ? 'bg-green-500 text-white scale-110' : 'bg-green-500/10 text-green-600'
          }`}>
            <Camera className="h-10 w-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Quét thực phẩm tại chợ</p>
          <p className="text-sm text-muted-foreground mt-1">
            Chụp ảnh nguyên liệu — AI tính kcal & gợi ý món ăn tức thì
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" />
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all active:scale-95"
          >
            <Camera className="h-4 w-4" /> Chụp ảnh
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium border border-border bg-card text-foreground hover:bg-secondary transition-all"
          >
            <Upload className="h-4 w-4" /> Tải lên
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Hoặc kéo &amp; thả ảnh vào đây</p>
      </div>
    </div>
  );

  const TipCard = () => (
    <div className="flex items-start gap-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 px-4 py-3">
      <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
      <p className="text-sm text-green-800 dark:text-green-300">
        <span className="font-medium">Mẹo:</span> Đặt thực phẩm trên bề mặt phẳng, chụp rõ từng loại để AI nhận diện chính xác nhất.
      </p>
    </div>
  );

  const ResultsPanel = () => (
    <div className="space-y-4">
      {loading && (
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-green-500/30 border-t-green-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Đang phân tích thực phẩm...</p>
          <p className="text-xs text-muted-foreground mt-1">AI đang nhận diện nguyên liệu</p>
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

      {!loading && result && (
        <div className="space-y-4">
          {/* Tổng kcal */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {result.dishes.length} nguyên liệu nhận diện được
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tổng dinh dưỡng ước tính</p>
              </div>
              <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-full px-2.5 py-1 font-medium">AI</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'total_calories', label: 'Calo',      unit: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-800/30' },
                  { key: 'total_protein',  label: 'Protein',   unit: 'g',    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-100 dark:border-blue-800/30'   },
                  { key: 'total_carbs',    label: 'Carbs',     unit: 'g',    color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-100 dark:border-amber-800/30'  },
                  { key: 'total_fat',      label: 'Chất béo',  unit: 'g',    color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/30' },
                ].map(n => (
                  <div key={n.key} className={`${n.bg} border ${n.border} rounded-xl p-3 text-center`}>
                    <p className="text-xs text-muted-foreground mb-1">{n.label}</p>
                    <p className={`text-xl font-bold ${n.color}`}>{(result as any)[n.key]}</p>
                    <p className="text-xs text-muted-foreground">{n.unit}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSave}
                disabled={saving || saved}
                className={`w-full rounded-xl h-11 transition-all ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</>
                ) : saved ? (
                  <><Check className="h-4 w-4 mr-2" />Đã lưu lịch sử quét!</>
                ) : (
                  <><Check className="h-4 w-4 mr-2" />Lưu vào lịch sử quét</>
                )}
              </Button>
            </div>
          </div>

          {/* Chi tiết từng nguyên liệu */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Chi tiết từng nguyên liệu
            </p>
            {result.dishes.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-green-500/10 text-green-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.matched_food?.dish_name_vi || item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.estimated_grams}g</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-orange-600 shrink-0 ml-2">{item.calories} kcal</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Protein', value: item.protein, unit: 'g', color: 'text-blue-600' },
                    { label: 'Carbs',   value: item.carbs,   unit: 'g', color: 'text-amber-600' },
                    { label: 'Béo',     value: item.fat,     unit: 'g', color: 'text-emerald-600' },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <p className={`text-sm font-semibold ${m.color}`}>{m.value}{m.unit}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
                {item.pregnancy_benefit && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                      🤰 {item.pregnancy_benefit}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Gợi ý món ăn */}
          {(result.recipe_suggestions?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-foreground text-sm">Gợi ý món ăn từ nguyên liệu này</h3>
              </div>
              <div className="p-4 space-y-2">
                {result.recipe_suggestions!.map((recipe, i) => {
                  const [emoji, ...rest] = recipe.split(' ');
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors">
                      <span className="text-lg shrink-0">{emoji}</span>
                      <p className="text-sm text-green-900 dark:text-green-300">{rest.join(' ')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lời khuyên AI */}
          {(result.suggestions?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Lời khuyên dinh dưỡng
              </p>
              {result.suggestions.map((s, i) => (
                <p key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-green-500 shrink-0 mt-0.5">•</span>
                  {s}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !result && !error && image && (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Ảnh đã tải lên</p>
              <p className="text-sm text-muted-foreground mt-1">Đang chuẩn bị phân tích...</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !result && !error && !image && (
        <div className="rounded-2xl border-2 border-dashed border-border/40 bg-secondary/20 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/5 flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-green-500/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Kết quả hiển thị ở đây</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Chụp ảnh thực phẩm để AI bắt đầu phân tích</p>
        </div>
      )}
    </div>
  );

  // ─── Lịch sử quét ────────────────────────────────────────────────────────
  const HistoryPanel = () => (
    <div className="space-y-3">
      {/* Header — dùng div thay vì button để tránh nested button (hydration error) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowHistory(v => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowHistory(v => !v); }}
        className="w-full flex items-center justify-between px-1 group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-sm text-foreground">Lịch sử quét thực phẩm</span>
          {history.length > 0 && (
            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5 font-medium">
              {history.length} lần
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); loadHistory(); }}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
          </button>
          {showHistory
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </div>

      {showHistory && (
        historyLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-green-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground rounded-2xl border border-dashed border-border">
            <History className="w-8 h-8 opacity-30" />
            <p className="text-sm">Chưa có lịch sử quét nào</p>
            <p className="text-xs">Quét thực phẩm để lưu vào lịch sử</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(item => (
              <div key={item.id} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{item.meal_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), 'HH:mm · dd/MM/yyyy', { locale: vi })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-sm font-bold text-orange-600">{item.calories} kcal</span>
                    {expandedId === item.id
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                </button>

                {expandedId === item.id && (
                  <div className="px-4 pb-4 border-t border-border/30">
                    {/* Macro detail */}
                    <div className="grid grid-cols-3 gap-3 pt-3">
                      {[
                        { label: 'Protein',    value: item.protein, unit: 'g', color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20'    },
                        { label: 'Carbs',      value: item.carbs,   unit: 'g', color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20'  },
                        { label: 'Chất béo',   value: item.fat,     unit: 'g', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20'},
                      ].map(m => (
                        <div key={m.label} className={`${m.bg} rounded-xl p-2.5 text-center`}>
                          <p className={`text-base font-bold ${m.color}`}>{m.value}{m.unit}</p>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Gợi ý thực phẩm bổ sung */}
                    <div className="mt-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1.5 flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> Gợi ý thực phẩm bổ sung
                      </p>
                      <div className="text-xs text-green-800 dark:text-green-300 space-y-1">
                        {buildNutritionTips(item).map((tip, i) => (
                          <p key={i}>{tip}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Scanner — 2 cột */}
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
              <div className="relative rounded-2xl overflow-hidden shadow-md">
                <img src={image} alt="Thực phẩm" className="w-full h-72 lg:h-96 object-cover" />
                <button
                  onClick={resetScan}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-sm transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full px-3 py-1">
                  Đang xem trước ảnh
                </div>
              </div>
              <TipCard />
            </>
          )}
        </div>

        {/* Cột phải: kết quả */}
        <div className="space-y-4">
          <ResultsPanel />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50 pt-2" />

      {/* Lịch sử quét */}
      <HistoryPanel />
    </div>
  );
}
