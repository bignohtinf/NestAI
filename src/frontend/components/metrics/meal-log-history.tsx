'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Utensils, Calendar, Camera, Clock,
  ChevronRight, Search, Filter, Loader2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { nutritionApi } from '@/lib/api';
import Image from 'next/image';

interface MealLogHistoryProps {
  targetUserId: string | null;
}

export function MealLogHistory({ targetUserId }: MealLogHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!targetUserId) return;
    
    async function loadLogs() {
      try {
        const res = await nutritionApi.getLogs(targetUserId!);
        setLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to load meal logs:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadLogs();
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang tải nhật ký bữa ăn...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
        <Utensils className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Chưa có nhật ký bữa ăn</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
          Hãy bắt đầu bằng việc quét ảnh bữa ăn hoặc ghi lại thực đơn mẹ đã ăn hôm nay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters/Search placeholder */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Tìm kiếm món ăn..." 
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-border/50 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" size="icon" className="rounded-xl border-border/50">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Log List */}
      <div className="grid grid-cols-1 gap-4">
        {logs.map((log) => (
          <Card key={log.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Image/Icon */}
                <div className="relative w-full sm:w-32 h-32 bg-muted shrink-0 overflow-hidden">
                  {log.image_url ? (
                    <Image 
                      src={log.image_url} 
                      alt={log.meal_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/50 backdrop-blur-md border-none text-[10px] text-white px-1.5 h-5">
                      {log.source === 'smart_scan' ? <Camera className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {log.source === 'smart_scan' ? 'AI Scan' : 'Manual'}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-lg text-foreground truncate">{log.meal_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">{Math.round(log.calories)} <span className="text-xs font-normal">kcal</span></p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Protein</p>
                        <p className="text-sm font-bold text-blue-600">{Math.round(log.protein || 0)}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Carbs</p>
                        <p className="text-sm font-bold text-amber-600">{Math.round(log.carbs || 0)}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fat</p>
                        <p className="text-sm font-bold text-emerald-600">{Math.round(log.fat || 0)}g</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-xs">
                      Chi tiết <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button variant="outline" className="rounded-xl px-8 border-border/50 text-muted-foreground">
          Tải thêm lịch sử
        </Button>
      </div>
    </div>
  );
}
