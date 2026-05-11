'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Hash, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

interface TopicStat {
  name: string;
  count: number;
}

interface ChatAnalytics {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  avgDurationSeconds: number;
  topTopics: TopicStat[];
  satisfactionScore: number;
  trends: Array<{ date: string; conversations: number; messages: number }>;
}

const PERIODS = [
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: '30 ngày' },
  { value: 'quarter', label: '3 tháng' },
  { value: 'year', label: '1 năm' },
];


export default function ChatAnalyticsPage() {
  const [data, setData] = useState<ChatAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getChatAnalytics(period);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch chat analytics:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-rose-500" />
            Thống kê hội thoại AI
          </h1>
          <p className="text-gray-500 mt-2">Phân tích chi tiết về hội thoại với hệ thống AI Nori</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  period === p.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {data && (
        <>
          {/* Stat cards — chỉ hiển thị data thực từ DB */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Tổng hội thoại
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{data.totalConversations.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Tất cả conversations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  Tổng tin nhắn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{data.totalMessages.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Tất cả messages</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  TB tin nhắn/cuộc
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{data.avgMessagesPerConversation.toFixed(1)}</div>
                <p className="text-xs text-gray-500 mt-1">Trung bình mỗi hội thoại</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Chủ đề phổ biến</CardTitle>
              <CardDescription>
                Phân tích từ tiêu đề hội thoại và câu hỏi của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.topTopics.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Chưa có đủ dữ liệu để phân tích chủ đề
                </p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const maxCount = data.topTopics[0]?.count || 1;
                    const colors = [
                      { bg: 'bg-rose-50', text: 'text-rose-700', bar: 'bg-rose-400', badge: 'bg-rose-100 text-rose-600' },
                      { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-400', badge: 'bg-blue-100 text-blue-600' },
                      { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-600' },
                      { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-400', badge: 'bg-purple-100 text-purple-600' },
                      { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-600' },
                    ];
                    return data.topTopics.map((topic, i) => {
                      const c = colors[i % colors.length];
                      const pct = Math.round((topic.count / maxCount) * 100);
                      return (
                        <div key={topic.name} className="flex items-center gap-3">
                          <div className="w-32 shrink-0">
                            <span className={`text-sm font-medium ${c.text}`}>{topic.name}</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-gray-100">
                            <div
                              className={`h-2 rounded-full ${c.bar} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge} w-16 text-center shrink-0`}>
                            {topic.count} lượt
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trends table */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động hội thoại theo thời gian</CardTitle>
              <CardDescription>Số cuộc hội thoại và tin nhắn theo ngày</CardDescription>
            </CardHeader>
            <CardContent>
              {data.trends.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Chưa có dữ liệu xu hướng cho kỳ này
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">Ngày</th>
                        <th className="text-right py-2 pr-4 text-rose-600 font-medium">Hội thoại</th>
                        <th className="text-right py-2 text-blue-600 font-medium">Tin nhắn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.trends.slice(-14).map((t) => (
                        <tr key={t.date} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 pr-4 text-gray-600">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                          <td className="py-2 pr-4 text-right font-semibold text-rose-600">{t.conversations}</td>
                          <td className="py-2 text-right font-semibold text-blue-600">{t.messages}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
