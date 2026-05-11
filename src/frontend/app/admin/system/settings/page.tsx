'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Bell, Lock, Loader2, CheckCircle2, AlertCircle, Database, Cpu, Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

// Types matching actual DB flat key-value structure

interface UISettings {
  // app general
  appVersion: string;
  maintenanceMode: boolean;
  supportedLanguages: string[];
  pregnancyReminderEnabled: boolean;
  defaultWaterIntakeMl: number;
  // AI
  aiDailyBudgetUsd: number;
  ragSimilarityThreshold: number;
  foodScanConfidenceThreshold: number;
  maxMealPlansPerDay: number;
}

// Transform: API flat key-value response -> UI state
// DB returns { "maintenance_mode": false, "ai_daily_budget_usd": 50.0, ... }
function apiToUI(raw: Record<string, any>): UISettings {
  return {
    appVersion:                   raw['app_version']                    ?? '1.0.0',
    maintenanceMode:              raw['maintenance_mode']               ?? false,
    supportedLanguages:           raw['supported_languages']            ?? ['vi', 'en'],
    pregnancyReminderEnabled:     raw['pregnancy_reminder_enabled']     ?? true,
    defaultWaterIntakeMl:         raw['default_water_intake_ml']        ?? 2500,
    aiDailyBudgetUsd:             raw['ai_daily_budget_usd']            ?? 50.0,
    ragSimilarityThreshold:       raw['rag_similarity_threshold']       ?? 0.75,
    foodScanConfidenceThreshold:  raw['food_scan_confidence_threshold'] ?? 0.75,
    maxMealPlansPerDay:           raw['max_meal_plans_per_day']         ?? 3,
  };
}

// Transform: UI state -> API flat key-value payload
// PUT /system/settings expects Dict[str, Any]
function uiToApi(ui: UISettings): Record<string, any> {
  return {
    app_version:                   ui.appVersion,
    maintenance_mode:              ui.maintenanceMode,
    supported_languages:           ui.supportedLanguages,
    pregnancy_reminder_enabled:    ui.pregnancyReminderEnabled,
    default_water_intake_ml:       ui.defaultWaterIntakeMl,
    ai_daily_budget_usd:           ui.aiDailyBudgetUsd,
    rag_similarity_threshold:      ui.ragSimilarityThreshold,
    food_scan_confidence_threshold: ui.foodScanConfidenceThreshold,
    max_meal_plans_per_day:        ui.maxMealPlansPerDay,
  };
}

// Reusable toggle switch component
function ToggleRow({
  label, desc, checked, onChange,
}: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-checked={checked}
        role="switch"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${
          checked ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// Reusable number input row
function NumberRow({
  label, desc, value, onChange, step, min, max, width = 'w-24',
}: {
  label: string; desc?: string; value: number; onChange: (v: number) => void;
  step?: number; min?: number; max?: number; width?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) =>
          onChange(step && step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10))
        }
        className={`${width} px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-right text-sm focus:outline-none focus:ring-2 focus:ring-rose-500`}
      />
    </div>
  );
}

// Page component
export default function SettingsPage() {
  const [ui, setUI] = useState<UISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        setError(null);
        const res = await adminApi.getSystemSettings();
        // res.settings = flat { "maintenance_mode": false, "ai_daily_budget_usd": 50, ... }
        setUI(apiToUI(res.settings || {}));
      } catch (err: any) {
        console.error('Failed to fetch settings:', err);
        setError('Cannot load settings. Check backend connection.');
        setUI(apiToUI({}));
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!ui) return;
    try {
      setSaving(true);
      setError(null);
      await adminApi.updateSystemSettings(uiToApi(ui));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError('Save failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof UISettings,>(key: K, val: UISettings[K]) =>
    setUI((prev) => (prev ? { ...prev, [key]: val } : prev));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-gray-700 dark:text-gray-300" />
            <span>Settings &amp; Security</span>
          </h1>
          <p className="text-gray-500 mt-2">Configure system parameters and security policies</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : success ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">

        {/* AI Configuration */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-rose-500" />
              AI Configuration
            </CardTitle>
            <CardDescription>AI budget, RAG and food scan thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumberRow
              label="Daily AI budget (USD)"
              desc="Max spend on AI APIs per day"
              value={ui!.aiDailyBudgetUsd}
              onChange={(v) => set('aiDailyBudgetUsd', v)}
              step={0.5} min={0} max={500}
              width="w-24"
            />
            <NumberRow
              label="RAG similarity threshold"
              desc="Min score to use a retrieved document (0-1)"
              value={ui!.ragSimilarityThreshold}
              onChange={(v) => set('ragSimilarityThreshold', v)}
              step={0.05} min={0} max={1}
              width="w-20"
            />
            <NumberRow
              label="Food scan confidence"
              desc="Min confidence to accept a food scan result (0-1)"
              value={ui!.foodScanConfidenceThreshold}
              onChange={(v) => set('foodScanConfidenceThreshold', v)}
              step={0.05} min={0} max={1}
              width="w-20"
            />
          </CardContent>
        </Card>

        {/* Nutrition & Reminders */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Nutrition &amp; Reminders
            </CardTitle>
            <CardDescription>Meal plans, water intake and pregnancy reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumberRow
              label="Max meal plans / day"
              value={ui!.maxMealPlansPerDay}
              onChange={(v) => set('maxMealPlansPerDay', v)}
              min={1} max={20}
            />
            <NumberRow
              label="Default water intake (ml)"
              desc="Recommended daily water intake"
              value={ui!.defaultWaterIntakeMl}
              onChange={(v) => set('defaultWaterIntakeMl', v)}
              min={500} max={5000} step={100}
              width="w-28"
            />
            <ToggleRow
              label="Pregnancy reminders"
              desc="Send weekly pregnancy milestone reminders"
              checked={ui!.pregnancyReminderEnabled}
              onChange={(v) => set('pregnancyReminderEnabled', v)}
            />
          </CardContent>
        </Card>

        {/* App General */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              App General
            </CardTitle>
            <CardDescription>Version and language settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">App version</p>
                <p className="text-xs text-gray-500">Current deployed version string</p>
              </div>
              <input
                type="text"
                value={ui!.appVersion}
                onChange={(e) => set('appVersion', e.target.value)}
                className="w-24 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-right text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Supported languages</p>
                <p className="text-xs text-gray-500">Comma-separated language codes</p>
              </div>
              <input
                type="text"
                value={ui!.supportedLanguages.join(', ')}
                onChange={(e) =>
                  set('supportedLanguages', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                }
                className="w-32 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-right text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode - full width */}
        <Card className="border-gray-200 dark:border-gray-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>Take the service offline for maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Activate maintenance</p>
                <p className="text-xs text-red-600 dark:text-red-500">
                  All users will see a maintenance page and cannot use the app
                </p>
              </div>
              <button
                type="button"
                onClick={() => set('maintenanceMode', !ui!.maintenanceMode)}
                aria-checked={ui!.maintenanceMode}
                role="switch"
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
                  ui!.maintenanceMode ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    ui!.maintenanceMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {ui!.maintenanceMode && (
              <p className="text-sm font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Maintenance is ON -- remember to turn it off when done!
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
