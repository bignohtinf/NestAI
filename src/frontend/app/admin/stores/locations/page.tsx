'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Map as MapIcon, MapPin, Loader2, Search,
  Globe, CheckCircle2, Edit3, Save, X, AlertCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=vi`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  latitude: number | null;
  longitude: number | null;
  food_items_count: number;
  status: string;
}

// ── Fetch tất cả stores theo batch (vượt giới hạn Supabase) ──────────────────
async function fetchAllStores(params: { search?: string; status?: string } = {}) {
  const BATCH = 500;
  const first = await adminApi.getStores({ ...params, limit: BATCH, offset: 0 });
  const total: number = first.total || 0;
  let items: any[] = first.stores || first.items || [];

  if (total <= BATCH) return items;

  const remainingPages = Math.ceil(total / BATCH) - 1;
  const rest = await Promise.all(
    Array.from({ length: remainingPages }, (_, i) =>
      adminApi.getStores({ ...params, limit: BATCH, offset: (i + 1) * BATCH })
    )
  );
  for (const r of rest) {
    items = [...items, ...(r.stores || r.items || [])];
  }
  return items;
}

export default function LocationsPage() {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [editingCoords, setEditingCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Phân trang sidebar
  const [listPage, setListPage] = useState(0);
  const LIST_PAGE_SIZE = 25;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const editMarkerRef = useRef<any>(null);
  const editingCoordsRef = useRef(editingCoords);

  // Keep ref in sync
  useEffect(() => { editingCoordsRef.current = editingCoords; }, [editingCoords]);

  // Fetch ALL stores (vượt giới hạn 100 của Supabase bằng cách loop theo batch)
  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        setListPage(0); // reset sidebar page khi search thay đổi
        const raw = await fetchAllStores(searchTerm ? { search: searchTerm } : {});
        const items = raw.map((s: any) => ({
          id: s.id,
          name: s.name,
          address: s.address || '',
          city: s.city || '',
          district: s.district || '',
          latitude: s.latitude ?? null,
          longitude: s.longitude ?? null,
          food_items_count: s.foodCount ?? s.food_items_count ?? 0,
          status: s.status ?? (s.isActive ? 'active' : 'inactive'),
        }));
        setStores(items);
      } catch (err) {
        console.error('Failed to fetch stores:', err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetch, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Init map
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) { setMapError(true); return; }
    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (!mapRef.current) return;
        const google = (window as any).google;
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 21.0285, lng: 105.8542 },
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
        });
        mapInstanceRef.current.addListener('click', (e: any) => {
          if (editingCoordsRef.current) {
            setEditingCoords({
              lat: e.latLng.lat().toFixed(6),
              lng: e.latLng.lng().toFixed(6),
            });
            if (editMarkerRef.current) editMarkerRef.current.setPosition(e.latLng);
          }
        });
        setMapReady(true);
      })
      .catch(() => setMapError(true));
  }, []);

  // Markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const google = (window as any).google;
    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    stores.forEach(store => {
      if (store.latitude == null || store.longitude == null) return;
      hasPoints = true;
      const pos = { lat: store.latitude, lng: store.longitude };
      bounds.extend(pos);
      const isSelected = selectedStore?.id === store.id;
      const isActive = store.status === 'active';

      const marker = new google.maps.Marker({
        position: pos, map,
        title: store.name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: isSelected ? '#EF4444' : isActive ? '#10B981' : '#9CA3AF',
          fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2,
          scale: isSelected ? 2 : 1.5,
          anchor: new google.maps.Point(12, 22),
          labelOrigin: new google.maps.Point(12, 10),
        },
        label: { text: store.name.substring(0, 2), color: '#fff', fontSize: '10px', fontWeight: 'bold' },
      });

      const info = new google.maps.InfoWindow({
        content: `<div style="padding:6px;max-width:240px;font-family:system-ui">
          <h3 style="margin:0 0 4px;font-size:14px;font-weight:600">${store.name}</h3>
          <p style="margin:0 0 2px;font-size:12px;color:#666">${store.address}</p>
          <p style="margin:0;font-size:11px;color:#888">${store.food_items_count} sản phẩm</p>
          <p style="margin:4px 0 0;font-size:10px;color:#aaa">${store.latitude?.toFixed(6)}, ${store.longitude?.toFixed(6)}</p>
        </div>`
      });
      marker.addListener('click', () => { setSelectedStore(store); info.open(map, marker); });
      markersRef.current.push(marker);
    });

    if (hasPoints) map.fitBounds(bounds);
  }, [stores, selectedStore, mapReady]);

  // Editing marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const google = (window as any).google;
    const map = mapInstanceRef.current;
    if (editMarkerRef.current) { editMarkerRef.current.setMap(null); editMarkerRef.current = null; }

    if (editingCoords) {
      const lat = parseFloat(editingCoords.lat);
      const lng = parseFloat(editingCoords.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        editMarkerRef.current = new google.maps.Marker({
          position: { lat, lng }, map, draggable: true,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#EF4444', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
          zIndex: 999,
        });
        editMarkerRef.current.addListener('dragend', (e: any) => {
          setEditingCoords({ lat: e.latLng.lat().toFixed(6), lng: e.latLng.lng().toFixed(6) });
        });
        map.panTo({ lat, lng }); map.setZoom(16);
      }
    }
  }, [editingCoords, mapReady]);

  // Save
  const handleSaveCoords = async () => {
    if (!selectedStore || !editingCoords) return;
    const lat = parseFloat(editingCoords.lat);
    const lng = parseFloat(editingCoords.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    setSaving(true);
    try {
      await adminApi.apiCall(`/api/admin/stores/${selectedStore.id}`, {
        method: 'PUT', body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      setStores(prev => prev.map(s => s.id === selectedStore.id ? { ...s, latitude: lat, longitude: lng } : s));
      setSelectedStore(prev => prev ? { ...prev, latitude: lat, longitude: lng } : prev);
      setEditingCoords(null);
    } catch (err) { console.error('Failed to save coords:', err); }
    finally { setSaving(false); }
  };

  const storesWithCoords = stores.filter(s => s.latitude != null && s.longitude != null);
  const storesWithoutCoords = stores.filter(s => s.latitude == null || s.longitude == null);

  // Phân trang sidebar list
  const listTotalPages = Math.ceil(stores.length / LIST_PAGE_SIZE);
  const pagedStores = stores.slice(listPage * LIST_PAGE_SIZE, (listPage + 1) * LIST_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapIcon className="h-8 w-8 text-emerald-500" />
            Quản lý vị trí & Bản đồ
          </h1>
          <p className="text-gray-500 mt-2">Xem và cập nhật tọa độ cửa hàng trên bản đồ</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {storesWithCoords.length} có tọa độ
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {storesWithoutCoords.length} thiếu tọa độ
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {mapError ? (
            <div className="h-[500px] rounded-2xl bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center gap-3 text-gray-500">
              <MapIcon className="w-12 h-12 opacity-30" />
              <p className="text-sm">Không thể tải Google Maps</p>
              <p className="text-xs">Kiểm tra NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
            </div>
          ) : (
            <div className="relative h-[500px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <div ref={mapRef} className="w-full h-full" />
              {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              )}
            </div>
          )}

          {editingCoords && selectedStore && (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      Đang chỉnh tọa độ: {selectedStore.name}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Click bản đồ hoặc kéo marker đỏ để đặt vị trí
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text" value={editingCoords.lat}
                      onChange={e => setEditingCoords(prev => prev ? { ...prev, lat: e.target.value } : prev)}
                      placeholder="Vĩ độ"
                      className="w-28 px-2 py-1.5 text-xs border rounded-lg bg-white dark:bg-gray-950"
                    />
                    <input
                      type="text" value={editingCoords.lng}
                      onChange={e => setEditingCoords(prev => prev ? { ...prev, lng: e.target.value } : prev)}
                      placeholder="Kinh độ"
                      className="w-28 px-2 py-1.5 text-xs border rounded-lg bg-white dark:bg-gray-950"
                    />
                    <button onClick={handleSaveCoords} disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Lưu
                    </button>
                    <button onClick={() => setEditingCoords(null)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X className="w-3 h-3" /> Hủy
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm cửa hàng..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {storesWithoutCoords.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Chưa có tọa độ ({storesWithoutCoords.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-amber-100 dark:divide-amber-900/30 max-h-[200px] overflow-y-auto">
                  {storesWithoutCoords.map(store => (
                    <button key={store.id}
                      onClick={() => {
                        setSelectedStore(store);
                        setEditingCoords({ lat: String(store.latitude ?? 21.0285), lng: String(store.longitude ?? 105.8542) });
                      }}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold text-xs">
                        {store.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{store.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{store.address}</p>
                      </div>
                      <Edit3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Tất cả cửa hàng ({stores.length})
                {listTotalPages > 1 && (
                  <span className="ml-auto text-[10px] font-normal text-gray-400">
                    Trang {listPage + 1}/{listTotalPages}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[350px] overflow-y-auto">
                    {pagedStores.map(store => (
                      // Dùng div thay button để tránh lồng <button> trong <button> (hydration error)
                      <div
                        key={store.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedStore(store);
                          if (store.latitude != null && store.longitude != null && mapInstanceRef.current) {
                            mapInstanceRef.current.panTo({ lat: store.latitude, lng: store.longitude });
                            mapInstanceRef.current.setZoom(16);
                          }
                        }}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          selectedStore?.id === store.id ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-l-2 border-l-emerald-500' : ''
                        }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          store.latitude != null
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}>
                          {store.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{store.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {store.latitude != null ? `${store.latitude.toFixed(4)}, ${store.longitude?.toFixed(4)}` : 'Chưa có tọa độ'}
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedStore(store);
                            setEditingCoords({ lat: String(store.latitude ?? 21.0285), lng: String(store.longitude ?? 105.8542) });
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 shrink-0"
                          title="Chỉnh sửa tọa độ">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Phân trang sidebar */}
                  {listTotalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400">
                        {listPage * LIST_PAGE_SIZE + 1}–{Math.min((listPage + 1) * LIST_PAGE_SIZE, stores.length)} / {stores.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setListPage(p => Math.max(0, p - 1))}
                          disabled={listPage === 0}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setListPage(p => Math.min(listTotalPages - 1, p + 1))}
                          disabled={listPage >= listTotalPages - 1}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
