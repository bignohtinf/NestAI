'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockUser } from '@/lib/mock-data';
import { Bell, Lock, Eye, Palette, Globe, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Setting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  toggle?: boolean;
  value?: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'notifications',
      title: 'Thông báo',
      description: 'Nhận thông báo về bữa ăn và mục tiêu',
      icon: <Bell className="w-5 h-5" />,
      toggle: true,
      value: true,
    },
    {
      id: 'privacy',
      title: 'Quyền riêng tư',
      description: 'Quản lý quyền truy cập dữ liệu',
      icon: <Lock className="w-5 h-5" />,
      toggle: false,
    },
    {
      id: 'visibility',
      title: 'Hiển thị',
      description: 'Kiểm soát ai có thể xem hồ sơ của bạn',
      icon: <Eye className="w-5 h-5" />,
      toggle: false,
    },
    {
      id: 'theme',
      title: 'Chủ đề',
      description: 'Chọn chủ đề sáng hoặc tối',
      icon: <Palette className="w-5 h-5" />,
      toggle: false,
    },
    {
      id: 'language',
      title: 'Ngôn ngữ',
      description: 'Chọn ngôn ngữ của ứng dụng',
      icon: <Globe className="w-5 h-5" />,
      toggle: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id && setting.toggle ? { ...setting, value: !setting.value } : setting
      )
    );
  };

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Cài đặt</h1>
          <p className="text-muted-foreground">Quản lý sở thích và cài đặt ứng dụng của bạn</p>
        </div>

        {/* Account Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Tài khoản</CardTitle>
            <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Thay đổi email</p>
                <p className="text-sm text-muted-foreground">{mockUser.email}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Đổi mật khẩu</p>
                <p className="text-sm text-muted-foreground">Cập nhật mật khẩu tài khoản của bạn</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Xóa tài khoản</p>
                <p className="text-sm text-muted-foreground text-red-500">Hành động này không thể hoàn tác</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Ứng dụng</CardTitle>
            <CardDescription>Tùy chỉnh trải nghiệm ứng dụng của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-primary mt-1">{setting.icon}</div>
                  <div>
                    <p className="font-medium text-foreground">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                {setting.toggle ? (
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      setting.value ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        setting.value ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </button>
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quyền riêng tư & Bảo mật</CardTitle>
            <CardDescription>Quản lý dữ liệu cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Tải dữ liệu của bạn</p>
                <p className="text-sm text-muted-foreground">Tải xuống bản sao tất cả dữ liệu của bạn</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Xóa dữ liệu</p>
                <p className="text-sm text-muted-foreground">Xóa tất cả dữ liệu cá nhân của bạn</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Kết nối ứng dụng</p>
                <p className="text-sm text-muted-foreground">Quản lý quyền truy cập ứng dụng bên thứ ba</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Hỗ trợ</CardTitle>
            <CardDescription>Cần giúp đỡ?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <HelpCircle className="w-5 h-5 text-primary mt-1" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Trung tâm trợ giúp</p>
                  <p className="text-sm text-muted-foreground">Tìm câu trả lời và hướng dẫn</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Gửi phản hồi</p>
                <p className="text-sm text-muted-foreground">Giúp chúng tôi cải thiện ứng dụng</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Điều khoản dịch vụ</p>
                <p className="text-sm text-muted-foreground">Đọc các điều khoản của chúng tôi</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>

        {/* App Version */}
        <div className="text-center py-6 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">Bữa Ăn Thông Minh v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-2">© 2024 Smart Meals. All rights reserved.</p>
        </div>
      </div>
    </MainLayout>
  );
}
