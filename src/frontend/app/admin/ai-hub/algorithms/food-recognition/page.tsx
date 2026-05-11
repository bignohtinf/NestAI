'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera, ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle,
  Activity, Clock, TrendingUp, RefreshCw, Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

interface AlgoDetail {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing';
  currentVersion: string;
  accuracy: number | null;
  avgResponseTimeMs: number | null;
  lastUpdated: string;
  configJson: {
    minConfidence?: number;
    imageSize?: string;
    maxAlternatives?: number;
    [key: string]: any;
  };
  callsThisMonth: number;
  successRate: number | null;
  lastTrainingDate: string | null;
}

function MetricCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: any; color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

function SliderParam({ label, description, value, min, max, step, onChange }: {
  label: string; description: string; value: number;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 min-w-[3.5rem] text-right">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 accent-blue-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

const IMAGE_SIZES = ['112x112', '224x224', '320x320', '448x448', '640x640'];

export default function FoodRecognitionAlgoPage() {
  const router = useRouter();
  const [algo, setAlgo] = useState<AlgoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [config, setConfig] = useState<AlgoDetail['configJson']>({});
  const [status, setStatus] = useState<'active' | 'inactive' | 'testing'>('active');

  const fetchAlgo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFoodRecognitionAlgo();
      setAlgo(data);
      setConfig(data.configJson ?? {});
      setStatus(data.status ?? 'active');
    } catch (err) {
      console.error('Failed to fetch food-recognition algo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlgo(); }, [fetchAlgo]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      await adminApi.updateFoodRecognitionAlgo({ status, configJson: config });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: string, value: any) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!algo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-500">
        <AlertCircle className="w-10 h-10" />
        <p>Khong tim thay cau hinh thuat toan.</p>
        <button onClick={() => router.push('/admin/ai-hub/algorithms')} className="text-sm text-blue-500 hover:underline">
          Quay lai
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/admin/ai-hub/algorithms')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lai danh sach
          </button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="h-8 w-8 text-blue-500" />
            Thuat toan nhan dien thuc pham
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{algo.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="active">Dang chay</option>
            <option value="testing">Kiem thu</option>
            <option value="inactive">Tat</option>
          </select>
          <button onClick={fetchAlgo} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title="Tai lai">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : saveStatus === 'error' ? <AlertCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Dang luu...' : saveStatus === 'success' ? 'Da luu!' : saveStatus === 'error' ? 'Loi!' : 'Luu thay doi'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Phien ban hien tai" value={`v${algo.currentVersion}`} icon={TrendingUp} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <MetricCard label="Do chinh xac" value={algo.accuracy != null ? `${(algo.accuracy * 100).toFixed(1)}%` : 'N/A'} icon={Camera} color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <MetricCard label="Thoi gian phan hoi" value={algo.avgResponseTimeMs != null ? `${algo.avgResponseTimeMs}ms` : 'N/A'} icon={Clock} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
        <MetricCard label="Luot goi thang nay" value={algo.callsThisMonth?.toLocaleString('vi-VN') ?? '0'} icon={Activity} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tham so mo hinh</CardTitle>
            <CardDescription>Dieu chinh cac tham so nhan dien hinh anh thuc pham</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SliderParam
              label="Nguong tin cay toi thieu"
              description="Chi tra ket qua khi confidence score lon hon gia tri nay"
              value={config.minConfidence ?? 0.80}
              min={0.5} max={0.99} step={0.01}
              onChange={(v) => updateConfig('minConfidence', v)}
            />
            <SliderParam
              label="So ket qua thay the toi da"
              description="So mon an thay the tra ve khi ket qua chinh co do tin cay thap"
              value={config.maxAlternatives ?? 3}
              min={1} max={10} step={1}
              onChange={(v) => updateConfig('maxAlternatives', v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Kich thuoc anh dau vao
            </CardTitle>
            <CardDescription>
              Anh lon hon cho do chinh xac cao hon nhung ton thoi gian xu ly hon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {IMAGE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => updateConfig('imageSize', size)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    (config.imageSize ?? '224x224') === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Dang chon: <span className="font-mono font-semibold text-blue-600">{config.imageSize ?? '224x224'}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Cau hinh hien tai (JSON)</CardTitle>
            <CardDescription>Xem truoc gia tri config_json se duoc luu vao database</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-48 leading-relaxed">
              {JSON.stringify(config, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Thong tin phien ban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ti le thanh cong</p>
                <p className="font-semibold">{algo.successRate != null ? `${(algo.successRate * 100).toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Lan train cuoi</p>
                <p className="font-semibold">{algo.lastTrainingDate ? new Date(algo.lastTrainingDate).toLocaleDateString('vi-VN') : 'Chua co'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cap nhat lan cuoi</p>
                <p className="font-semibold">{new Date(algo.lastUpdated).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Trang thai</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase ${status === 'active' ? 'bg-green-100 text-green-700' : status === 'testing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                  {status === 'active' ? 'Dang chay' : status === 'testing' ? 'Kiem thu' : 'Tat'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
