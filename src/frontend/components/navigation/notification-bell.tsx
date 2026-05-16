'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, Utensils, CalendarDays, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { nutritionApi } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { FoodScanNotificationDialog } from '@/components/notifications/food-scan-dialog';
import { MealPlanNotificationDialog } from '@/components/notifications/meal-plan-dialog';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

type DialogType = 'scan_food' | 'meal_plan_generated' | 'meal_plan_created' | null;

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  if (days < 7) return `${days} ngày`;
  return date.toLocaleDateString('vi-VN');
}

const TYPE_META: Record<string, { icon: React.ReactNode; dot: string }> = {
  scan_food: {
    icon: <Utensils className="h-4 w-4 text-emerald-600" />,
    dot: 'bg-emerald-500',
  },
  meal_plan_generated: {
    icon: <CalendarDays className="h-4 w-4 text-blue-600" />,
    dot: 'bg-blue-500',
  },
  meal_plan_created: {
    icon: <CalendarDays className="h-4 w-4 text-blue-600" />,
    dot: 'bg-blue-500',
  },
};

export function NotificationBell() {
  const { user } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Dialog state
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id || user.role === 'admin') return;
    try {
      const data = await nutritionApi.getNotifications(user.id, false, 20);
      setNotifications(data.notifications || []);
    } catch { /* ignore */ }
  }, [user?.id, user?.role]);

  // Fetch sau 2s delay (warm up) + poll mỗi 3 phút
  useEffect(() => {
    const delay = setTimeout(fetchNotifications, 2000);
    const timer = setInterval(fetchNotifications, 180_000);
    return () => { clearTimeout(delay); clearInterval(timer); };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Chỉ hiện các loại thông báo có type icon (scan_food, meal_plan_generated)
  const displayed = notifications
    .filter((n) => n.type === 'scan_food' || n.type === 'meal_plan_generated' || n.type === 'meal_plan_created')
    .slice(0, 8);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await nutritionApi.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setSelectedNotif((prev) => prev?.id === notifId ? { ...prev, is_read: true } : prev);
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await nutritionApi.markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const openDialog = (notif: Notification) => {
    setOpen(false);
    // Nhỏ delay để popover đóng trước khi dialog mở
    setTimeout(() => {
      setSelectedNotif(notif);
      setDialogType(notif.type as DialogType);
    }, 80);
  };

  const closeDialog = () => {
    setDialogType(null);
    setTimeout(() => setSelectedNotif(null), 300);
  };

  // Không render cho admin
  if (!user || user.role === 'admin') return null;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 p-0 hover:bg-primary/10"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-80 p-0 shadow-xl border border-border/60"
        >
          {/* Header popover */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <p className="text-sm font-semibold">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs bg-red-100 text-red-600 font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Đọc tất cả
              </button>
            )}
          </div>

          {/* Danh sách */}
          <div className="max-h-[360px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
                <Bell className="h-8 w-8 opacity-30" />
                <p className="text-xs">Không có thông báo mới</p>
              </div>
            ) : (
              displayed.map((notif) => {
                const meta = TYPE_META[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => openDialog(notif)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 ${
                      !notif.is_read ? 'bg-primary/3' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === 'scan_food' ? 'bg-emerald-50' : 'bg-blue-50'
                    }`}>
                      {meta?.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug line-clamp-2 ${!notif.is_read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatTime(new Date(notif.created_at))} trước
                      </p>
                    </div>

                    {/* Unread dot + arrow */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {!notif.is_read && (
                        <span className={`w-2 h-2 rounded-full ${meta?.dot ?? 'bg-primary'}`} />
                      )}
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 mt-auto" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/50 bg-muted/20">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              Xem tất cả thông báo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      {/* Dialogs */}
      {selectedNotif && dialogType === 'scan_food' && (
        <FoodScanNotificationDialog
          open={dialogType === 'scan_food'}
          onOpenChange={(o) => { if (!o) closeDialog(); }}
          notificationTitle={selectedNotif.title}
          data={selectedNotif.data || {}}
          isRead={selectedNotif.is_read}
          onMarkAsRead={() => handleMarkAsRead(selectedNotif.id)}
        />
      )}

      {selectedNotif && (dialogType === 'meal_plan_generated' || dialogType === 'meal_plan_created') && (
        <MealPlanNotificationDialog
          open={dialogType === 'meal_plan_generated' || dialogType === 'meal_plan_created'}
          onOpenChange={(o) => { if (!o) closeDialog(); }}
          notificationTitle={selectedNotif.title}
          data={selectedNotif.data || {}}
          isRead={selectedNotif.is_read}
          onMarkAsRead={() => handleMarkAsRead(selectedNotif.id)}
        />
      )}
    </>
  );
}
