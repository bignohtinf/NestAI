'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Utensils, ChevronDown, ChevronUp, Info, Pencil, Loader2, ChefHat, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import { nutritionApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Label maps
const CONDITION_LABELS: Record<string, { label: string; icon: string }> = {
  none: { label: 'Không có bệnh lý', icon: '✅' },
  gdm: { label: 'Tiểu đường thai kỳ', icon: '🍬' },
  anemia: { label: 'Thiếu máu / thiếu sắt', icon: '🩸' },
  hypertension: { label: 'Cao huyết áp thai kỳ', icon: '💊' },
};

interface Dish {
  stt: string;
  id: string;
  dish_name_vietnamese: string;
  group_name_vietnamese: string;
  dish_type: string;
}

interface MealPlan {
  breakfast: { dishes: Dish[]; stts: number[] };
  lunch: { dishes: Dish[]; stts: number[] };
  dinner: { dishes: Dish[]; stts: number[] };
}

export function NutritionRecommendations() {
  const { user } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>('lunch');
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileStt, setSelectedProfileStt] = useState<string>("");
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);
  
  // Locking logic
  const [lockedMeals, setLockedMeals] = useState<Record<string, number[]>>({});

  const gestationWeeks = user?.gestationWeeks ?? null;
  const condition = user?.condition ?? 'none';
  const conditionInfo = CONDITION_LABELS[condition] ?? CONDITION_LABELS['none'];

  // Load profiles and auto-select best match
  useEffect(() => {
    async function loadProfiles() {
      try {
        const response = await nutritionApi.getProfiles();
        setProfiles(response.profiles);
        
        if (response.profiles.length > 0) {
          let matchedStt = response.profiles[0].stt.toString();
          
          if (gestationWeeks != null) {
            const trimesterLabel = gestationWeeks < 13 
              ? "Phụ nữ có thai 3 tháng đầu" 
              : gestationWeeks < 28 
                ? "Phụ nữ có thai 3 tháng giữa" 
                : "Phụ nữ có thai 3 tháng cuối";
            
            const match = response.profiles.find((p: any) => 
              p.profile["Tình trạng sinh lý/Physiological condition"] === trimesterLabel
            );
            if (match) matchedStt = match.stt.toString();
          }
          
          setSelectedProfileStt(matchedStt);
        }
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setIsProfilesLoading(false);
      }
    }
    loadProfiles();
  }, [gestationWeeks]);

  const handleGenerate = async () => {
    if (!selectedProfileStt) return;
    
    setIsGenerating(true);
    try {
      const response = await nutritionApi.getFullDayRecommendations(
        parseInt(selectedProfileStt),
        lockedMeals
      );
      setPlans(response.plans);
      setActivePlanIdx(0);
      setHasGenerated(true);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLock = (mealKey: string, stts: number[]) => {
    setLockedMeals(prev => {
      const next = { ...prev };
      if (next[mealKey]) {
        delete next[mealKey];
      } else {
        next[mealKey] = stts;
      }
      return next;
    });
  };

  const activePlan = plans[activePlanIdx];

  const MEAL_INFO = [
    { key: 'breakfast', label: 'Bữa sáng', icon: '🌅', time: '07:00' },
    { key: 'lunch', label: 'Bữa trưa', icon: '☀️', time: '12:00' },
    { key: 'dinner', label: 'Bữa tối', icon: '🌙', time: '18:30' },
  ];

  return (
    <div className="space-y-4">
      {/* Configuration Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Sinh thực đơn cả ngày
          </CardTitle>
          <CardDescription>
            Tự động cân đối dinh dưỡng cho Sáng, Trưa và Tối
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Hồ sơ:</span>
              {isProfilesLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Select value={selectedProfileStt} onValueChange={setSelectedProfileStt}>
                  <SelectTrigger className="h-8 text-xs bg-muted/50">
                    <SelectValue placeholder="Chọn hồ sơ" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.filter(p => p.profile["Tình trạng sinh lý/Physiological condition"]).map((p) => (
                      <SelectItem key={p.stt} value={p.stt.toString()} className="text-xs">
                        {p.profile["Tình trạng sinh lý/Physiological condition"]} ({p.profile["Nhóm tuổi/Age group"]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/60 border border-border/50">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-white">
                  {conditionInfo.icon} {conditionInfo.label}
                </Badge>
                {Object.keys(lockedMeals).length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1 bg-amber-100 text-amber-700 border-amber-200">
                    <Lock className="h-2.5 w-2.5" /> Đã khóa {Object.keys(lockedMeals).length} bữa
                  </Badge>
                )}
              </div>
              <Link href="/profile" className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Pencil className="h-2.5 w-2.5" /> Sửa
              </Link>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProfileStt}
            size="lg"
            className="w-full gap-2 shadow-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                AI đang tính toán...
              </>
            ) : (
              <>
                <ChefHat className="h-4 w-4" />
                {hasGenerated ? 'Cập nhật các bữa chưa khóa' : 'Sinh thực đơn AI'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {hasGenerated && activePlan ? (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Thực đơn gợi ý cho bạn
              </h3>
              {plans.length > 1 && (
                <div className="flex gap-1">
                  {plans.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActivePlanIdx(i)}
                      className={`h-1.5 w-4 rounded-full transition-colors ${i === activePlanIdx ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {MEAL_INFO.map((m) => {
                const mealData = activePlan[m.key as keyof MealPlan];
                const isExpanded = expandedMeal === m.key;
                const isLocked = !!lockedMeals[m.key];
                
                return (
                  <Card key={m.key} className={`overflow-hidden transition-all ${isLocked ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <button
                        className="flex-1 text-left flex items-center gap-3"
                        onClick={() => setExpandedMeal(isExpanded ? null : m.key)}
                      >
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <p className="text-sm font-semibold flex items-center gap-2">
                            {m.label}
                            {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{m.time} • {mealData.dishes.length} món</p>
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${isLocked ? 'text-amber-600' : 'text-muted-foreground'}`}
                          onClick={() => toggleLock(m.key, mealData.stts)}
                        >
                          {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <button onClick={() => setExpandedMeal(isExpanded ? null : m.key)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border/40 p-4 bg-white/50">
                        <div className="space-y-2">
                          {mealData.dishes.length > 0 ? (
                            mealData.dishes.map((dish, i) => (
                              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white border border-border/40 shadow-sm">
                                <Badge variant="secondary" className="mt-0.5 text-[9px] uppercase px-1 h-4 shrink-0">
                                  {dish.dish_type.replace('món ', '')}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-tight">{dish.dish_name_vietnamese}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{dish.group_name_vietnamese}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic text-center py-2">Không tìm thấy tổ hợp món phù hợp</p>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        ) : !isGenerating && (
          <div className="py-16 flex flex-col items-center justify-center text-center opacity-60">
            <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-sm font-medium">Bấm &ldquo;Sinh thực đơn AI&rdquo; để bắt đầu</h4>
            <p className="text-xs text-muted-foreground max-w-[240px] mt-1">
              Gợi ý chi tiết cho 3 bữa ăn chính trong ngày.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">Mẹo sử dụng:</p>
          <ul className="list-disc pl-3 space-y-1">
            <li>Bấm biểu tượng 🔓 để <strong>khóa</strong> bữa ăn bạn ưng ý.</li>
            <li>Bấm <strong>Cập nhật</strong> để AI tìm món mới cho các bữa chưa khóa.</li>
            <li>Thực đơn đảm bảo ít nhất 1 món mặn cho bữa sáng; đầy đủ mặn, rau, canh, tinh bột cho bữa trưa và tối.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
