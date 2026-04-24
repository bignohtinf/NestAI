'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Utensils, ChevronDown, ChevronUp, Info, Pencil } from 'lucide-react';
import Link from 'next/link';

// Label maps
const CONDITION_LABELS: Record<string, { label: string; icon: string }> = {
  none: { label: 'Không có bệnh lý', icon: '✅' },
  gdm: { label: 'Tiểu đường thai kỳ', icon: '🍬' },
  anemia: { label: 'Thiếu máu / thiếu sắt', icon: '🩸' },
  hypertension: { label: 'Cao huyết áp thai kỳ', icon: '💊' },
};

const TRIMESTER_INFO = (weeks: number) => {
  if (weeks < 13) return 'Tam cá nguyệt 1 — folate rất quan trọng';
  if (weeks < 28) return 'Tam cá nguyệt 2 — giai đoạn tăng trưởng chính';
  return 'Tam cá nguyệt 3 — nhu cầu sắt 27mg/ngày';
};

// Sample meal structure shown while AI not connected
const SAMPLE_MENU = {
  meals: [
    {
      slot: 'Bữa sáng',
      time: '7:00',
      icon: '🌅',
      dishes: [
        { name: 'Cháo yến mạch với trứng luộc', kcal: 320, note: 'GI thấp — kiểm soát đường huyết' },
        { name: 'Sữa đậu nành không đường', kcal: 80, note: 'Protein + Canxi' },
      ],
    },
    {
      slot: 'Bữa phụ sáng',
      time: '10:00',
      icon: '🍎',
      dishes: [
        { name: 'Táo xanh + 10 hạt hạnh nhân', kcal: 150, note: 'Chất xơ — làm chậm hấp thụ đường' },
      ],
    },
    {
      slot: 'Bữa trưa',
      time: '12:00',
      icon: '☀️',
      dishes: [
        { name: 'Cơm gạo lứt (½ chén)', kcal: 180, note: 'GI thấp hơn gạo trắng' },
        { name: 'Cá hồi áp chảo', kcal: 250, note: 'DHA cho não thai nhi' },
        { name: 'Rau cải xào tỏi', kcal: 60, note: 'Folate + Sắt' },
        { name: 'Canh bí đỏ nấu tôm', kcal: 90, note: 'Kẽm + Beta-carotene' },
      ],
    },
    {
      slot: 'Bữa phụ chiều',
      time: '15:30',
      icon: '🌿',
      dishes: [
        { name: 'Sữa chua không đường + việt quất', kcal: 130, note: 'Canxi + Probiotics' },
      ],
    },
    {
      slot: 'Bữa tối',
      time: '18:30',
      icon: '🌙',
      dishes: [
        { name: 'Bún bò Huế (ít huyết)', kcal: 380, note: 'Sắt + Protein — bổ sung máu' },
        { name: 'Rau muống luộc', kcal: 40, note: 'Folate' },
      ],
    },
  ],
  totals: { kcal: 1680, protein: 82, iron: 24, folate: 520, calcium: 890, dha: 180 },
  targets: { kcal: '1800–2200', protein: '71g', iron: '27mg', folate: '600mcg', calcium: '1000mg', dha: '200mg' },
};

export function NutritionRecommendations() {
  const { user } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>('Bữa trưa');

  const gestationWeeks = user?.gestationWeeks ?? null;
  const condition = user?.condition ?? 'none';
  const conditionInfo = CONDITION_LABELS[condition] ?? CONDITION_LABELS['none'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsGenerating(false);
    setHasGenerated(true);
    setExpandedMeal('Bữa sáng');
  };

  const totalKcal = SAMPLE_MENU.totals.kcal;
  const targetKcalStr = SAMPLE_MENU.targets.kcal;

  return (
    <div className="space-y-4">
      {/* Compact profile summary + generate button */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Sinh thực đơn hôm nay
          </CardTitle>
          <CardDescription>
            AI gợi ý món Việt phù hợp với hồ sơ thai kỳ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile summary row — compact, read-only */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/60 border border-border/50">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap gap-y-1.5">
              {gestationWeeks != null ? (
                <Badge variant="default" className="text-xs gap-1 shrink-0">
                  🤰 Tuần {gestationWeeks}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs shrink-0">
                  ⚠ Chưa có tuần thai
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                {conditionInfo.icon} {conditionInfo.label}
              </Badge>
              {gestationWeeks != null && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {TRIMESTER_INFO(gestationWeeks)}
                </span>
              )}
            </div>
            {/* Edit shortcut */}
            <Link
              href="/profile"
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </Link>
          </div>

          {/* Missing profile warning */}
          {gestationWeeks == null && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span>
                Chưa có ngày dự sinh —{' '}
                <Link href="/profile" className="underline font-medium">
                  cập nhật hồ sơ thai kỳ
                </Link>{' '}
                để AI cá nhân hóa chính xác hơn.
              </span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                AI đang tạo thực đơn...
              </>
            ) : (
              <>
                <Utensils className="h-4 w-4" />
                {hasGenerated ? 'Tạo lại thực đơn' : 'Tạo thực đơn hôm nay'}
              </>
            )}
          </Button>

          {!hasGenerated && !isGenerating && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400" />
              <span>
                Thực đơn mẫu bên dưới — bấm &ldquo;Tạo thực đơn&rdquo; để AI sinh thực đơn
                theo đúng tuần thai và bệnh lý của bạn.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal plan result */}
      <div className="space-y-3">
        {/* Summary bar */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-foreground">
            {hasGenerated ? '✅ Thực đơn hôm nay' : '📋 Thực đơn mẫu'}
            {condition !== 'none' && (
              <Badge variant="default" className="ml-2 text-xs">
                {conditionInfo.icon} {conditionInfo.label}
              </Badge>
            )}
          </h3>
          <span className="text-xs text-muted-foreground">
            {totalKcal} / {targetKcalStr} kcal
          </span>
        </div>

        {/* Macros summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: 'Sắt', value: SAMPLE_MENU.totals.iron, unit: 'mg', target: 27, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Folate', value: SAMPLE_MENU.totals.folate, unit: 'mcg', target: 600, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Canxi', value: SAMPLE_MENU.totals.calcium, unit: 'mg', target: 1000, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'DHA', value: SAMPLE_MENU.totals.dha, unit: 'mg', target: 200, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Protein', value: SAMPLE_MENU.totals.protein, unit: 'g', target: 71, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Calo', value: SAMPLE_MENU.totals.kcal, unit: 'kcal', target: 2000, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((m) => {
            const pct = Math.min(100, Math.round((m.value / m.target) * 100));
            return (
              <div key={m.label} className={`${m.bg} rounded-xl p-2 text-center`}>
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <div className="mt-1 h-1 w-full rounded-full bg-black/10">
                  <div
                    className={`h-1 rounded-full ${m.color.replace('text-', 'bg-')}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{pct}%</p>
              </div>
            );
          })}
        </div>

        {/* Meal list */}
        <div className="space-y-2">
          {SAMPLE_MENU.meals.map((meal) => {
            const isExpanded = expandedMeal === meal.slot;
            const mealKcal = meal.dishes.reduce((sum, d) => sum + d.kcal, 0);
            return (
              <Card key={meal.slot} className="overflow-hidden">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedMeal(isExpanded ? null : meal.slot)}
                >
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meal.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{meal.slot}</p>
                        <p className="text-xs text-muted-foreground">{meal.time} • {meal.dishes.length} món</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{mealKcal} kcal</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border/40 px-4 pb-3 pt-2 space-y-2">
                    {meal.dishes.map((dish, i) => (
                      <div key={i} className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{dish.name}</p>
                          <p className="text-xs text-muted-foreground">{dish.note}</p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground shrink-0">
                          {dish.kcal} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center px-4">
          * Thực đơn mẫu minh họa. AI sẽ sinh thực đơn cá nhân hóa theo tuần thai và bệnh lý thực tế của bạn.
        </p>
      </div>
    </div>
  );
}
