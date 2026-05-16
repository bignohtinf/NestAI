'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';
import { Bell, Check, X, UserPlus, Utensils, ExternalLink, ChevronRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { nutritionApi } from '@/lib/api';
import { FoodScanNotificationDialog } from '@/components/notifications/food-scan-dialog';
import { MealPlanNotificationDialog } from '@/components/notifications/meal-plan-dialog';

interface PartnershipRequest {
  id: string;
  status: string;
  created_at: string;
  requested_by: string;
  sender: { full_name: string; email: string } | null;
}

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

export default function NotificationsPage() {
  const { ready, user } = useAuthGuard({ blockedRoles: ['admin'] });
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dialog state
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);

  useEffect(() => {
    if (!user?.id || !ready) return;
    fetchData();
  }, [user?.id, ready]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPendingRequests(), fetchNotifications()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`/api/partnerships/pending?user_id=${user!.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setRequests(data.partnerships || []);
    } catch (e) {
      console.error('Failed to fetch partnership requests:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await nutritionApi.getNotifications(user!.id, false, 50);
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  const handleRespond = async (partnershipId: string, action: 'accept' | 'reject') => {
    setActionLoading(partnershipId + action);
    setMessage(null);
    try {
      const res = await fetch('/api/partnerships/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnershipId, action, userId: user!.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setRequests((prev) => prev.filter((r) => r.id !== partnershipId));
      } else {
        setMessage({ type: 'error', text: data.message || 'Đã xảy ra lỗi' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await nutritionApi.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      // Cập nhật selectedNotif nếu đang mở
      setSelectedNotif((prev) => prev?.id === notificationId ? { ...prev, is_read: true } : prev);
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const openDialog = (notif: Notification) => {
    setSelectedNotif(notif);
    setDialogType(notif.type as DialogType);
    // Không tự đánh dấu đã đọc — user phải bấm nút "Đánh dấu đã đọc" tường minh
  };

  const closeDialog = () => {
    setDialogType(null);
    // Giữ selectedNotif vài ms để animation đóng mượt
    setTimeout(() => setSelectedNotif(null), 300);
  };

  if (!ready) return null;

  // Phân loại thông báo
  const scanFoodNotifs       = notifications.filter((n) => n.type === 'scan_food');
  const mealPlanNotifs       = notifications.filter((n) => n.type === 'meal_plan_generated' || n.type === 'meal_plan_created');
  const otherNotifs          = notifications.filter((n) => n.type !== 'scan_food' && n.type !== 'meal_plan_generated' && n.type !== 'meal_plan_created');
  const totalCount           = requests.length + notifications.length;

  // Helper: badge đếm chưa đọc
  const unreadBadge = (list: Notification[]) => {
    const count = list.filter((n) => !n.is_read).length;
    if (!count) return null;
    return (
      <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold rounded-full px-2 py-0.5">
        {count} mới
      </span>
    );
  };

  return (
    <MainLayout fullWidth>
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground mt-1">
            {totalCount > 0 ? `Bạn có ${totalCount} thông báo` : 'Không có thông báo mới'}
          </p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : totalCount > 0 ? (
          <div className="space-y-8">

            {/* ── Bữa ăn quét ảnh (scan_food) ── */}
            {scanFoodNotifs.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-sm">🍽️</div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bữa ăn của vợ</h2>
                  {unreadBadge(scanFoodNotifs)}
                </div>

                {scanFoodNotifs.map((notif) => (
                  <Card
                    key={notif.id}
                    className={`cursor-pointer transition-all hover:shadow-md hover:border-emerald-200 ${
                      notif.is_read ? 'opacity-60' : 'border-emerald-100 bg-emerald-50/30'
                    }`}
                    onClick={() => openDialog(notif)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 rounded-full bg-emerald-100 shrink-0">
                          <Utensils className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-snug">{notif.title}</h3>
                            {!notif.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">{formatTime(new Date(notif.created_at))}</p>
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                              Xem chi tiết <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}

            {/* ── Thực đơn AI (meal_plan_generated) ── */}
            {mealPlanNotifs.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-sm">📋</div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Thực đơn ngày</h2>
                  {unreadBadge(mealPlanNotifs)}
                </div>

                {mealPlanNotifs.map((notif) => {
                  const planDate = notif.data?.plan_date;
                  const dateLabel = planDate
                    ? new Date(planDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                    : null;

                  return (
                    <Card
                      key={notif.id}
                      className={`cursor-pointer transition-all hover:shadow-md hover:border-blue-200 ${
                        notif.is_read ? 'opacity-60' : 'border-blue-100 bg-blue-50/20'
                      }`}
                      onClick={() => openDialog(notif)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 p-2 rounded-full bg-blue-100 shrink-0">
                            <CalendarDays className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-sm leading-snug">{notif.title}</h3>
                              {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-muted-foreground">
                                {formatTime(new Date(notif.created_at))}
                                {dateLabel && <span className="ml-2 font-medium text-blue-600">· {dateLabel}</span>}
                              </p>
                              <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5">
                                Xem thực đơn <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>
            )}

            {/* ── Thông báo dinh dưỡng khác ── */}
            {otherNotifs.length > 0 && (
              <section className="space-y-3">
                {(scanFoodNotifs.length > 0 || mealPlanNotifs.length > 0) && (
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Dinh dưỡng & gợi ý
                  </h2>
                )}
                {otherNotifs.map((notif) => (
                  <Card key={notif.id} className={notif.is_read ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 rounded-full bg-emerald-50">
                          <Utensils className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{notif.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTime(new Date(notif.created_at))}</p>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <Link href="/nutrition-scan">
                              <Button size="sm" variant="outline" className="gap-1">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Xem thực đơn
                              </Button>
                            </Link>
                            {!notif.is_read && (
                              <Button size="sm" variant="secondary" onClick={() => handleMarkAsRead(notif.id)} className="gap-1">
                                <Check className="h-3.5 w-3.5" />
                                Đánh dấu đã đọc
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}

            {/* ── Yêu cầu kết nối gia đình ── */}
            {requests.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Kết nối gia đình
                </h2>
                {requests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 rounded-full bg-blue-50">
                          <UserPlus className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">Yêu cầu kết nối gia đình</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">
                              {req.sender?.full_name || req.sender?.email || 'Người dùng'}
                            </span>{' '}
                            muốn kết nối với bạn
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTime(new Date(req.created_at))}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={() => handleRespond(req.id, 'accept')} disabled={actionLoading !== null} className="gap-1">
                              <Check className="h-3.5 w-3.5" />
                              {actionLoading === req.id + 'accept' ? 'Đang xử lý...' : 'Chấp nhận'}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleRespond(req.id, 'reject')} disabled={actionLoading !== null} className="gap-1 text-destructive hover:text-destructive">
                              <X className="h-3.5 w-3.5" />
                              {actionLoading === req.id + 'reject' ? 'Đang xử lý...' : 'Từ chối'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Không có thông báo nào</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Dialogs ── */}
      {selectedNotif && dialogType === 'scan_food' && (
        <FoodScanNotificationDialog
          open={dialogType === 'scan_food'}
          onOpenChange={(open) => { if (!open) closeDialog(); }}
          notificationTitle={selectedNotif.title}
          data={selectedNotif.data || {}}
          isRead={selectedNotif.is_read}
          onMarkAsRead={() => handleMarkAsRead(selectedNotif.id)}
        />
      )}

      {selectedNotif && (dialogType === 'meal_plan_generated' || dialogType === 'meal_plan_created') && (
        <MealPlanNotificationDialog
          open={dialogType === 'meal_plan_generated' || dialogType === 'meal_plan_created'}
          onOpenChange={(open) => { if (!open) closeDialog(); }}
          notificationTitle={selectedNotif.title}
          data={selectedNotif.data || {}}
          isRead={selectedNotif.is_read}
          onMarkAsRead={() => handleMarkAsRead(selectedNotif.id)}
        />
      )}
    </MainLayout>
  );
}

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}
