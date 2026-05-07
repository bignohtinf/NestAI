'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Bell, Lock, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await adminApi.getSystemSettings();
        setSettings(res.settings);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminApi.updateSystemSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-gray-700" />
            Cài đặt & Bảo mật
          </h1>
          <p className="text-gray-500 mt-2">Cấu hình tham số hệ thống và chính sách bảo mật</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Đang lưu...' : success ? 'Đã lưu!' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Settings */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Chính sách bảo mật
            </CardTitle>
            <CardDescription>Yêu cầu mật khẩu và xác thực</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Độ dài mật khẩu tối thiểu</label>
                <p className="text-xs text-gray-500">Người dùng bắt buộc phải dùng mật khẩu mạnh</p>
              </div>
              <input 
                type="number" 
                value={settings?.security?.min_password_length || 8}
                onChange={(e) => setSettings({...settings, security: {...settings.security, min_password_length: parseInt(e.target.value)}})}
                className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-950 text-right" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Bắt buộc 2FA cho Admin</label>
                <p className="text-xs text-gray-500">Tăng cường bảo mật cho tài khoản quản trị</p>
              </div>
              <input 
                type="checkbox"
                checked={settings?.security?.require_2fa_admin || false}
                onChange={(e) => setSettings({...settings, security: {...settings.security, require_2fa_admin: e.target.checked}})}
                className="w-5 h-5 accent-rose-500" 
              />
            </div>
          </CardContent>
        </Card>

        {/* AI & RAG Settings */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-rose-500" />
              Cấu hình AI Hub
            </CardTitle>
            <CardDescription>Quản lý giới hạn và mô hình mặc định</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Token limit per session</label>
                <p className="text-xs text-gray-500">Giới hạn token cho mỗi phiên chat</p>
              </div>
              <input 
                type="number" 
                value={settings?.ai?.max_tokens_per_session || 2000}
                onChange={(e) => setSettings({...settings, ai: {...settings.ai, max_tokens_per_session: parseInt(e.target.value)}})}
                className="w-20 px-2 py-1 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-950 text-right" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">RAG Confidence Score</label>
                <p className="text-xs text-gray-500">Độ tin cậy tối thiểu để trả lời từ tài liệu</p>
              </div>
              <input 
                type="number" 
                step="0.1"
                value={settings?.ai?.min_rag_score || 0.7}
                onChange={(e) => setSettings({...settings, ai: {...settings.ai, min_rag_score: parseFloat(e.target.value)}})}
                className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-950 text-right" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Thông báo hệ thống
            </CardTitle>
            <CardDescription>Cấu hình kênh gửi thông báo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Bật Push Notifications</label>
              <input 
                type="checkbox"
                checked={settings?.notifications?.push_enabled || true}
                onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, push_enabled: e.target.checked}})}
                className="w-5 h-5 accent-rose-500" 
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Bật Email Alerts</label>
              <input 
                type="checkbox"
                checked={settings?.notifications?.email_enabled || true}
                onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, email_enabled: e.target.checked}})}
                className="w-5 h-5 accent-rose-500" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Chế độ bảo trì
            </CardTitle>
            <CardDescription>Tạm dừng dịch vụ để bảo trì</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-red-700 dark:text-red-400">Kích hoạt bảo trì</label>
                <p className="text-xs text-red-600 dark:text-red-500/70">Người dùng sẽ không thể truy cập app</p>
              </div>
              <input 
                type="checkbox"
                checked={settings?.system?.maintenance_mode || false}
                onChange={(e) => setSettings({...settings, system: {...settings.system, maintenance_mode: e.target.checked}})}
                className="w-6 h-6 accent-red-600" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
