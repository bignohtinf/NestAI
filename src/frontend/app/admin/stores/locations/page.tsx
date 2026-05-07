'use client';

import { useState, useEffect } from 'react';
import { Map, MapPin, Search, Navigation, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        // Using getStores as a proxy or specific locations API
        const res = await adminApi.getStores({ limit: 50 });
        setLocations(res.items || []);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Map className="h-8 w-8 text-green-500" />
            Quản lý vị trí & Bản đồ
          </h1>
          <p className="text-gray-500 mt-2">Định vị các điểm cung cấp thực phẩm trên bản đồ hệ thống</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 min-h-[500px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/105.8,21.0,12,0/800x600?access_token=mock')] bg-cover opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair"></div>
          <div className="relative z-10 text-center space-y-4">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Navigation className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl border border-white dark:border-gray-700">
              <p className="text-sm font-medium">Interactive Map View</p>
              <p className="text-xs text-gray-500">Bản đồ hiển thị {locations.length} điểm cung cấp</p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Danh sách điểm đến</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="Tìm địa chỉ..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded outline-none" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>
              ) : (
                locations.map((loc) => (
                  <div key={loc.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{loc.name}</div>
                        <div className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{loc.address}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-gray-500">
                             {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
