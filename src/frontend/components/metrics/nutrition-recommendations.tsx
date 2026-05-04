'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, RefreshCw, Utensils, Info, Camera, Loader2, ChefHat, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { SmartScan } from '@/components/metrics/smart-scan';
import { WeekCalendar } from '@/components/metrics/week-calendar';
import { MealCard } from '@/components/metrics/meal-card';
import { nutritionApi } from '@/lib/api';

const MEAL_INFO = [
  { key: 'breakfast', label: 'Bữa sáng', icon: '🌅', time: '07:00' },
  { key: 'lunch', label: 'Bữa trưa', icon: '☀️', time: '12:00' },
  { key: 'dinner', label: 'Bữa tối', icon: '🌙', time: '18:30' },
];

const CHILD_AGE_GROUPS = ['0-5 tháng', '6-8 tháng', '9-11 tháng', '1-2 tuổi', '3-5 tuổi'];

function getMonday(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function formatDateVi(iso: string): string {
  const d = new Date(iso);
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function formatBudget(val: string): string {
  const num = val.replace(/\D/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('vi-VN');
}

function calculateAge(dob: string | undefined): number | undefined {
  if (!dob) return undefined;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function NutritionRecommendations() {
  const { user } = useApp();
  const isFather = user?.role === 'father';

  // Partner (mother) ID for father's read-only view
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isFather || !user?.id) return;
    fetch(`/api/partnerships/active?user_id=${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const p = data?.partnership;
        if (p) setPartnerUserId(p.mother_id !== user.id ? p.mother_id : p.father_id);
      })
      .catch(() => {});
  }, [isFather, user?.id]);

  // The user ID to use for loading meal plans
  const planUserId = isFather ? partnerUserId : user?.id;

  // Week & date
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [savedDates, setSavedDates] = useState<Set<string>>(new Set());
  const [weekPlans, setWeekPlans] = useState<Record<string, any>>({});

  // Target
  const [target, setTarget] = useState<'mother' | 'baby'>('mother');
  const [babyAge, setBabyAge] = useState<string | null>(null);

  // Config
  const [budgetInput, setBudgetInput] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileStt, setSelectedProfileStt] = useState<string>('');
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [lockedMeals, setLockedMeals] = useState<Record<string, number[]>>({});

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Existing saved plan for current date
  const currentDayPlan = weekPlans[selectedDate] || null;
  const hasSavedPlan = !!currentDayPlan;

  const gestationWeeks = user?.gestationWeeks ?? null;

  // ─── Load Profiles ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await nutritionApi.getProfiles();
        setProfiles(res.profiles);
      } catch (e) {
        console.error('Failed to load profiles:', e);
      } finally {
        setIsProfilesLoading(false);
      }
    }
    load();
  }, []);

  // ─── Auto-match profile ─────────────────────────────────────────────
  useEffect(() => {
    if (!profiles.length) return;

    if (target === 'baby') {
      // Match baby age group
      if (babyAge) {
        const match = profiles.find((p: any) => {
          const age = p.age_group || p.profile?.['Nhóm tuổi/Age group'] || '';
          return age === babyAge;
        });
        if (match) { setSelectedProfileStt(match.stt.toString()); return; }
      }
      // Default to first child profile
      const child = profiles.find((p: any) => {
        const age = p.age_group || p.profile?.['Nhóm tuổi/Age group'] || '';
        return CHILD_AGE_GROUPS.some(a => age.includes(a));
      });
      if (child) setSelectedProfileStt(child.stt.toString());
    } else {
      // Match mother by gestation weeks
      if (gestationWeeks != null) {
        const label = gestationWeeks < 13
          ? 'Phụ nữ có thai 3 tháng đầu'
          : gestationWeeks < 28
            ? 'Phụ nữ có thai 3 tháng giữa'
            : 'Phụ nữ có thai 3 tháng cuối';

        const match = profiles.find((p: any) => {
          const cond = p.physiological_condition || p.profile?.['Tình trạng sinh lý/Physiological condition'] || '';
          return cond === label;
        });
        if (match) { setSelectedProfileStt(match.stt.toString()); return; }
      }
      if (profiles.length > 0) setSelectedProfileStt(profiles[0].stt.toString());
    }
  }, [profiles, target, babyAge, gestationWeeks]);

  // ─── Resolve Baby Age from Context ──────────────────────────────────
  useEffect(() => {
    if (user?.babyStatus === 'born' && user.babyDob) {
      const months = Math.floor((Date.now() - new Date(user.babyDob).getTime()) / (30.44 * 24 * 60 * 60 * 1000));
      if (months < 6) setBabyAge('0-5 tháng');
      else if (months < 9) setBabyAge('6-8 tháng');
      else if (months < 12) setBabyAge('9-11 tháng');
      else if (months < 36) setBabyAge('1-2 tuổi');
      else setBabyAge('3-5 tuổi');
    } else {
      setBabyAge(null);
    }
  }, [user?.babyStatus, user?.babyDob]);

  // ─── Load Weekly Plans ──────────────────────────────────────────────
  const loadWeekPlans = useCallback(async () => {
    if (!planUserId) return;
    try {
      const res = await nutritionApi.getWeeklyMealPlans(planUserId, weekStart);
      setWeekPlans(res.plans || {});
      const saved = new Set<string>();
      Object.entries(res.plans || {}).forEach(([date, plan]) => {
        if (plan) saved.add(date);
      });
      setSavedDates(saved);
    } catch { /* ignore */ }
  }, [planUserId, weekStart]);

  useEffect(() => { loadWeekPlans(); }, [loadWeekPlans]);

  // Load saved plan into view when selecting a date that has one
  useEffect(() => {
    if (currentDayPlan?.plan_data) {
      setActivePlan(currentDayPlan.plan_data);
      setPlans([currentDayPlan.plan_data]);
      setActivePlanIdx(0);
    } else {
      setActivePlan(null);
      setPlans([]);
    }
  }, [selectedDate, currentDayPlan]);

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleWeekChange = (dir: -1 | 1) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const handleGenerate = async () => {
    if (!selectedProfileStt) return;
    setIsGenerating(true);
    setSaveMessage(null);
    try {
      const budget = budgetInput ? Number(budgetInput.replace(/\D/g, '')) : undefined;
      const res = await nutritionApi.getFullDayRecommendations(
        parseInt(selectedProfileStt),
        lockedMeals,
        [],
        budget
      );
      setPlans(res.plans);
      setActivePlanIdx(0);
      setActivePlan(res.plans[0] || null);
    } catch (e) {
      console.error('Failed to generate:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hasSavedPlan && hour >= 9) {
      setShowResetWarning(true);
    } else {
      doReset();
    }
  };

  const doReset = async () => {
    setShowResetWarning(false);
    if (currentDayPlan?.id) {
      try { await nutritionApi.deleteMealPlan(currentDayPlan.id); } catch { /* ignore */ }
    }
    setActivePlan(null);
    setPlans([]);
    await loadWeekPlans();
    handleGenerate();
  };

  const handleSave = async () => {
    if (!user?.id || !activePlan) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await nutritionApi.saveMealPlan({
        userId: user.id,
        planDate: selectedDate,
        planData: activePlan,
        nutritionSummary: activePlan.nutrition_summary,
        estimatedCost: activePlan.estimated_cost,
        target,
        profileStt: parseInt(selectedProfileStt),
        dailyBudgetVnd: budgetInput ? Number(budgetInput.replace(/\D/g, '')) : undefined,
      });
      setSaveMessage({ type: 'success', text: '✅ Đã lưu thực đơn và thông báo cho bố!' });
      await loadWeekPlans();
    } catch {
      setSaveMessage({ type: 'error', text: '❌ Lưu thất bại, thử lại sau.' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLock = (mealKey: string, stts: number[]) => {
    setLockedMeals(prev => {
      const next = { ...prev };
      if (next[mealKey]) delete next[mealKey];
      else next[mealKey] = stts;
      return next;
    });
  };

  // ─── Derived ────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const isPastDate = selectedDate < today;

  const profileLabel = (() => {
    if (!selectedProfileStt || !profiles.length) return '';
    const p = profiles.find((x: any) => x.stt.toString() === selectedProfileStt);
    if (!p) return '';
    
    // For mother target, show pregnancy week and age
    if (target === 'mother') {
      const motherAge = calculateAge(user?.dob);
      const ageStr = motherAge ? ` • ${motherAge} tuổi` : '';
      
      if (gestationWeeks != null) {
        const label = gestationWeeks < 13
          ? 'Phụ nữ có thai 3 tháng đầu'
          : gestationWeeks < 28
            ? 'Phụ nữ có thai 3 tháng giữa'
            : 'Phụ nữ có thai 3 tháng cuối';
        return label + ageStr;
      }
      return 'Phụ nữ có thai' + ageStr;
    }
    
    // For baby target, use actual baby age data
    if (target === 'baby') {
      if (babyAge) {
        return babyAge;
      }
      // If no baby age but pregnant, show pregnancy info instead
      if (user?.babyStatus === 'pregnant' && gestationWeeks != null) {
        return `Mang bầu tuần ${gestationWeeks}`;
      }
      return 'Chưa có thông tin bé';
    }
    
    // Fallback to profile data
    const age = p.age_group || p.profile?.['Nhóm tuổi/Age group'] || '';
    const cond = p.physiological_condition || p.profile?.['Tình trạng sinh lý/Physiological condition'] || '';
    return cond ? `${age} • ${cond}` : age;
  })();

  const totalNutrition = activePlan?.nutrition_summary?.total;
  const totalCost = activePlan?.estimated_cost?.total;

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Week Calendar */}
      <WeekCalendar
        weekStart={weekStart}
        selectedDate={selectedDate}
        savedDates={savedDates}
        onSelectDate={setSelectedDate}
        onWeekChange={handleWeekChange}
      />

      {/* Config Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Thực đơn ngày {formatDateVi(selectedDate)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Target Toggle — hidden for father (read-only view) */}
          {!isFather && (
            <div className="flex gap-2">
              <button
                onClick={() => setTarget('mother')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${target === 'mother' ? 'bg-pink-50 border-pink-200 text-pink-700 shadow-sm' : 'bg-white border-border/50 text-muted-foreground hover:bg-muted/40'}`}
              >
                🤰 Mẹ
              </button>
              <button
                onClick={() => setTarget('baby')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${target === 'baby' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-border/50 text-muted-foreground hover:bg-muted/40'}`}
              >
                👶 Bé
              </button>
            </div>
          )}

          {/* Profile info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Hồ sơ:</span>
            {isProfilesLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : profileLabel ? (
              <Badge variant="default" className="text-xs">{profileLabel}</Badge>
            ) : (
              <Badge variant="warning" className="text-xs">⚠ Chưa xác định</Badge>
            )}
            {target === 'mother' && gestationWeeks == null && (
              <Badge variant="warning" className="text-[10px]">Chưa có tuần thai</Badge>
            )}
            {target === 'baby' && !babyAge && user?.babyStatus === 'born' && (
              <Badge variant="warning" className="text-[10px]">Chưa có thông tin bé</Badge>
            )}
          </div>

          {/* Budget & action buttons — hidden for father */}
          {!isFather && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground shrink-0">💰 Ngân sách:</span>
                <div className="relative flex-1 max-w-[200px]">
                  <input
                    type="text"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(formatBudget(e.target.value))}
                    placeholder="Không giới hạn"
                    className="w-full h-8 px-2.5 pr-12 text-sm border border-border/60 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">VNĐ</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={hasSavedPlan ? handleReset : handleGenerate}
                  disabled={isGenerating || isPastDate}
                  className="w-full sm:flex-1 gap-2"
                >
                  {isGenerating ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Đang tạo...</>
                  ) : hasSavedPlan ? (
                    <><RotateCcw className="h-4 w-4" /> Tạo lại</>
                  ) : (
                    <><Utensils className="h-4 w-4" /> Tạo thực đơn</>
                  )}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full sm:w-auto gap-2 shrink-0 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                      <Camera className="h-4 w-4" /> Quét ảnh bữa ăn
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Quét ảnh bữa ăn</DialogTitle></DialogHeader>
                    <div className="py-2"><SmartScan /></div>
                  </DialogContent>
                </Dialog>
              </div>

              {!activePlan && !isGenerating && !hasSavedPlan && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400" />
                  <span>
                    {isPastDate
                      ? "Không thể tạo thực đơn cho ngày trong quá khứ."
                      : "Bấm \"Tạo thực đơn\" để AI sinh thực đơn theo đúng hồ sơ dinh dưỡng."}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Father: show info if no partner linked yet */}
          {isFather && !partnerUserId && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400" />
              <span>Chưa kết nối gia đình. Vào tab <strong>Quan hệ</strong> để ghép đôi với mẹ.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal Plan Results */}
      {activePlan ? (
        <div className="space-y-4">
          {/* Plan selector dots */}
          {plans.length > 1 && (
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Utensils className="h-4 w-4" /> Thực đơn gợi ý
              </h3>
              <div className="flex gap-1">
                {plans.map((_, i) => (
                  <button key={i} onClick={() => { setActivePlanIdx(i); setActivePlan(plans[i]); }}
                    className={`h-1.5 w-4 rounded-full transition-colors ${i === activePlanIdx ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>
          )}

          {/* Meal cards */}
          {MEAL_INFO.map(m => {
            const mealData = activePlan[m.key] || { dishes: [], stts: [] };
            const isLocked = !!lockedMeals[m.key];
            const ns = activePlan.nutrition_summary?.[m.key];
            return (
              <MealCard
                key={m.key}
                mealKey={m.key}
                label={m.label}
                icon={m.icon}
                time={m.time}
                dishes={mealData.dishes || []}
                stts={mealData.stts || []}
                nutritionSummary={ns}
                isLocked={isLocked}
                onToggleLock={toggleLock}
                defaultExpanded={m.key === 'lunch'}
              />
            );
          })}

          {/* Nutrition Summary */}
          <Card className="bg-gradient-to-r from-emerald-50/80 to-blue-50/80 border-emerald-100">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">📊 Tổng ngày</h4>
              {totalNutrition ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Năng lượng</p>
                    <p className="font-bold text-orange-600">{Math.round(totalNutrition.energy || 0)} kcal</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Protein</p>
                    <p className="font-bold text-blue-600">{(totalNutrition.protein || 0).toFixed(1)}g</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Fat</p>
                    <p className="font-bold text-amber-600">{(totalNutrition.fat || 0).toFixed(1)}g</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Carbs</p>
                    <p className="font-bold text-green-600">{(totalNutrition.carbohydrate || 0).toFixed(1)}g</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Chưa có thông tin dinh dưỡng</p>
              )}
              {totalCost != null && totalCost > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  💰 Chi phí ước tính: <span className="font-semibold text-foreground">{Number(totalCost).toLocaleString('vi-VN')}đ</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons — hidden for father (read-only) */}
          {!isFather && (
            <div className="flex gap-3">
              {!hasSavedPlan && !isPastDate && (
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? 'Đang lưu...' : 'Sử dụng thực đơn này'}
                </Button>
              )}
              <Button onClick={handleReset} variant="secondary" className="gap-2" disabled={isGenerating || isPastDate}>
                <RotateCcw className="h-4 w-4" /> Tạo lại
              </Button>
            </div>
          )}

          {/* Save message */}
          {saveMessage && (
            <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {saveMessage.text}
            </div>
          )}
        </div>
      ) : !isGenerating && (
        <div className="py-16 flex flex-col items-center justify-center text-center opacity-60">
          <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-sm font-medium">
            {isFather ? 'Mẹ chưa lưu thực đơn cho ngày này' : hasSavedPlan ? 'Đã có thực đơn cho ngày này' : 'Bấm "Tạo thực đơn" để bắt đầu'}
          </h4>
          <p className="text-xs text-muted-foreground max-w-[240px] mt-1">
            {isFather ? 'Thực đơn sẽ hiển thị khi mẹ tạo và lưu.' : 'Gợi ý chi tiết cho 3 bữa ăn chính trong ngày.'}
          </p>
        </div>
      )}

      {/* 9h Reset Warning Dialog */}
      <Dialog open={showResetWarning} onOpenChange={setShowResetWarning}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Xác nhận thay đổi
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Đã quá <strong>9h sáng</strong>. Thay đổi thực đơn lúc này có thể ảnh hưởng đến việc chuẩn bị bữa ăn.
            Bạn có chắc muốn tạo lại?
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowResetWarning(false)}>Giữ nguyên</Button>
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={doReset}>Tạo lại</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tips */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">Mẹo sử dụng:</p>
          <ul className="list-disc pl-3 space-y-1">
            <li>Chọn ngày trên lịch tuần để tạo hoặc xem thực đơn.</li>
            <li>Bấm 🔓 để <strong>khóa</strong> bữa ăn bạn ưng ý trước khi tạo lại.</li>
            <li>Bấm <strong>&ldquo;Sử dụng thực đơn&rdquo;</strong> để lưu và gửi thông báo cho bố.</li>
            <li>Reset sau 9h sáng sẽ có cảnh báo xác nhận.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
