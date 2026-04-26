'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Check, X, UserPlus, Utensils } from 'lucide-react';
import { nutritionApi } from '@/lib/api';

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

export default function NotificationsPage() {
  const { user } = useApp();
  const router = useRouter();
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role === 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.id || user.role === 'admin') return;
    fetchData();
  }, [user?.id]);

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
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  if (!user || user.role === 'admin') return null;

  const totalCount = requests.length + notifications.length;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl mx-auto py-6">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground mt-1">
            {totalCount > 0
              ? `Bạn có ${totalCount} thông báo mới`
              : 'Không có thông báo mới'}
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
          <div className="space-y-3">
            {/* Meal Plan Notifications */}
            {notifications.map((notif) => (
              <Card key={notif.id} className={notif.is_read ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 rounded-full bg-emerald-50">
                      <Utensils className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{notif.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(new Date(notif.created_at))}
                      </p>
                      {!notif.is_read && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="mt-3 gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Đánh dấu đã đọc
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Partnership Requests */}
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(new Date(req.created_at))}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleRespond(req.id, 'accept')}
                          disabled={actionLoading !== null}
                          className="gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {actionLoading === req.id + 'accept' ? 'Đang xử lý...' : 'Chấp nhận'}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRespond(req.id, 'reject')}
                          disabled={actionLoading !== null}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                          {actionLoading === req.id + 'reject' ? 'Đang xử lý...' : 'Từ chối'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
