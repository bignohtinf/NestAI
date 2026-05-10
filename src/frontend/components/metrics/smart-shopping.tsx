'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Globe, MapPin, Phone, ExternalLink, Search,
  Loader2, ShoppingCart, Star, Tag, RefreshCw,
  Store, CheckCircle2, Clock, ChevronRight,
  Navigation, UtensilsCrossed, X, Map as MapIcon,
  List, AlertCircle, ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminApi, storesApi } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

interface StoreItem {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  website?: string;
  isActive: boolean;
  foodCount?: number;
  logoUrl?: string;
  openHours?: string;
}

interface NearbyStore {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  operating_hours?: string;
  food_items_count: number;
  distance_km: number;
  available_dishes?: {
    stt: number;
    name: string;
    price_db?: number;
    price_at_store?: number;
    image_url?: string;
  }[];
  travel_info?: {
    distance_text: string;
    duration_text: string;
    duration_value: number;
  } | null;
}

interface MatchedDish {
  stt: number;
  name: string;
  price_vnd?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STORE_TYPE_LABELS: Record<string, string> = {
  supermarket: 'Siêu thị',
  convenience: 'Cửa hàng tiện lợi',
  market: 'Chợ',
  online: 'Online',
};

const STORE_TYPE_COLORS: Record<string, string> = {
  supermarket: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  convenience: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  market: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const SHOPPING_TIPS = [
  { icon: '🥩', label: 'Thịt & Hải sản', hint: 'Chọn loại tươi, có màu đỏ hồng tự nhiên' },
  { icon: '🥦', label: 'Rau củ quả', hint: 'Ưu tiên rau xanh đậm, giàu folate cho mẹ' },
  { icon: '🥛', label: 'Sữa & Trứng', hint: 'Bổ sung canxi & đạm thiết yếu' },
  { icon: '🌾', label: 'Ngũ cốc', hint: 'Gạo lứt, yến mạch — chất xơ tốt cho tiêu hóa' },
  { icon: '🍊', label: 'Trái cây', hint: 'Cam, bưởi giàu vitamin C, hấp thu sắt tốt hơn' },
];

const POPULAR_DISHES = [
  'Cơm tấm', 'Phở bò', 'Bún chả', 'Canh chua', 'Gà kho gừng',
  'Cá hồi', 'Trứng chiên', 'Rau muống xào', 'Thịt kho tàu', 'Súp gà',
];

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// ── Google Maps Loader ───────────────────────────────────────────────────────

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
    script.onerror = () => reject(new Error('Google Maps load failed'));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

// ── Google Map Component ─────────────────────────────────────────────────────

function StoreMap({
  stores,
  userLocation,
  selectedStoreId,
  onSelectStore,
}: {
  stores: NearbyStore[];
  userLocation: { lat: number; lng: number } | null;
  selectedStoreId: string | null;
  onSelectStore: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Init map
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setMapError(true);
      return;
    }
    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (!mapRef.current) return;
        const center = userLocation
          ? { lat: userLocation.lat, lng: userLocation.lng }
          : { lat: 21.0285, lng: 105.8542 }; // Hà Nội default

        mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
          ],
        });
        setMapReady(true);
      })
      .catch(() => setMapError(true));
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const google = (window as any).google;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    // User marker
    if (userLocation) {
      userMarkerRef.current = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map,
        title: 'Vị trí của bạn',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
        zIndex: 999,
      });
    }

    // Store markers
    const bounds = new google.maps.LatLngBounds();
    if (userLocation) {
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    }

    stores.forEach((store, idx) => {
      const pos = { lat: store.latitude, lng: store.longitude };
      bounds.extend(pos);

      const isSelected = store.id === selectedStoreId;
      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: store.name,
        label: {
          text: String(idx + 1),
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: isSelected ? '#EF4444' : '#10B981',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: isSelected ? 2 : 1.6,
          anchor: new google.maps.Point(12, 22),
          labelOrigin: new google.maps.Point(12, 10),
        },
        zIndex: isSelected ? 100 : 50 - idx,
      });

      const infoContent = `
        <div style="padding:8px;max-width:260px;font-family:system-ui">
          <h3 style="margin:0 0 4px;font-size:14px;font-weight:600">${store.name}</h3>
          <p style="margin:0 0 4px;font-size:12px;color:#666">${store.address}</p>
          <p style="margin:0;font-size:12px;color:#059669;font-weight:500">
            ${store.distance_km} km
            ${store.travel_info ? ` · ${store.travel_info.duration_text}` : ''}
          </p>
          ${store.available_dishes?.length ? `<p style="margin:4px 0 0;font-size:11px;color:#888">${store.available_dishes.length} món có sẵn</p>` : ''}
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({ content: infoContent });

      marker.addListener('click', () => {
        onSelectStore(store.id);
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    if (stores.length > 0 || userLocation) {
      map.fitBounds(bounds);
      if (stores.length <= 1) {
        map.setZoom(14);
      }
    }
  }, [stores, userLocation, selectedStoreId, mapReady]);

  if (mapError) {
    return (
      <div className="h-[400px] rounded-2xl bg-secondary/30 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <MapIcon className="w-10 h-10 opacity-30" />
        <p className="text-sm">Không thể tải bản đồ</p>
        <p className="text-xs">Kiểm tra GOOGLE MAPS API KEY</p>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function SmartShopping() {
  // --- Tab state ---
  const [activeView, setActiveView] = useState<'stores' | 'find'>('find');

  // --- Find nearby state ---
  const [dishSearch, setDishSearch] = useState('');
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [matchedDishes, setMatchedDishes] = useState<MatchedDish[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedNearbyStore, setSelectedNearbyStore] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // --- Store list state (original) ---
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [total, setTotal] = useState(0);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);

  // ── Get user location ──────────────────────────────────────────────────
  const getUserLocation = useCallback(() => {
    if (userLocation) return;
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Bạn đã từ chối quyền định vị. Hãy bật lại trong cài đặt trình duyệt.'
            : 'Không thể xác định vị trí. Thử lại sau.'
        );
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [userLocation]);

  // Auto-get location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // ── Search nearby stores ───────────────────────────────────────────────
  const searchNearbyStores = useCallback(async (dishName?: string) => {
    if (!userLocation) {
      setNearbyError('Cần cho phép truy cập vị trí để tìm cửa hàng gần bạn');
      return;
    }

    setNearbyLoading(true);
    setNearbyError('');
    setHasSearched(true);

    try {
      const result = await storesApi.searchNearby({
        dish: dishName || undefined,
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: searchRadius,
        limit: 20,
      });
      setNearbyStores(result.stores || []);
      setMatchedDishes(result.matched_dishes || []);
      setSelectedNearbyStore(null);
    } catch (err) {
      console.error('Search nearby failed:', err);
      setNearbyError('Không thể tìm cửa hàng. Thử lại sau.');
    } finally {
      setNearbyLoading(false);
    }
  }, [userLocation, searchRadius]);

  const handleDishSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchNearbyStores(dishSearch);
  };

  // ── Fetch store list (original) ────────────────────────────────────────
  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStores({ limit: 50, search });
      setStores(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView !== 'stores') return;
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [search, activeView]);

  const filtered = stores.filter(s => filterType === 'all' || s.type === filterType);
  const activeCount = stores.filter(s => s.isActive).length;

  const selectedNearby = nearbyStores.find(s => s.id === selectedNearbyStore);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-secondary/40 rounded-2xl w-fit">
        <button
          onClick={() => setActiveView('find')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeView === 'find'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Navigation className="w-4 h-4" />
          Tìm cửa hàng gần
        </button>
        <button
          onClick={() => setActiveView('stores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeView === 'stores'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Store className="w-4 h-4" />
          Tất cả cửa hàng
        </button>
      </div>

      {/* ═══════════ TÌM CỬA HÀNG GẦN ═══════════ */}
      {activeView === 'find' && (
        <div className="space-y-5">
          {/* Location status */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm ${
            userLocation
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : locationError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          }`}>
            {locationLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Đang xác định vị trí...</span>
              </>
            ) : userLocation ? (
              <>
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Đã xác định vị trí ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{locationError || 'Chưa có vị trí'}</span>
                <button
                  onClick={getUserLocation}
                  className="ml-auto text-xs font-medium underline"
                >
                  Thử lại
                </button>
              </>
            )}
          </div>

          {/* Search form */}
          <form onSubmit={handleDishSearch} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <UtensilsCrossed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={dishSearch}
                  onChange={e => setDishSearch(e.target.value)}
                  placeholder="Nhập tên món ăn (VD: Phở bò, Cá hồi, Rau muống...)"
                  className="w-full pl-11 pr-10 py-3 text-sm bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                {dishSearch && (
                  <button
                    type="button"
                    onClick={() => setDishSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Radius selector */}
              <div className="flex items-center gap-2">
                <select
                  value={searchRadius}
                  onChange={e => setSearchRadius(Number(e.target.value))}
                  className="px-3 py-3 text-sm bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value={3}>3 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={nearbyLoading || !userLocation}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {nearbyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {dishSearch ? 'Tìm cửa hàng' : 'Tất cả gần đây'}
              </button>
            </div>
          </form>

          {/* Popular dish suggestions */}
          {!hasSearched && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Gợi ý tìm kiếm nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DISHES.map(dish => (
                  <button
                    key={dish}
                    onClick={() => {
                      setDishSearch(dish);
                      if (userLocation) searchNearbyStores(dish);
                    }}
                    className="px-3 py-1.5 text-xs rounded-full border border-border bg-background hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {dish}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched dishes info */}
          {matchedDishes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Món tìm được:</span>
              {matchedDishes.map(d => (
                <span
                  key={d.stt}
                  className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium"
                >
                  {d.name}
                  {d.price_vnd && (
                    <span className="ml-1 text-emerald-500">~{d.price_vnd.toLocaleString()}đ</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Error */}
          {nearbyError && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-2xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {nearbyError}
            </div>
          )}

          {/* Results */}
          {hasSearched && !nearbyLoading && (
            <div className="space-y-4">
              {/* Result header */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy <span className="font-bold text-foreground">{nearbyStores.length}</span> cửa hàng
                  {dishSearch && <span> có <span className="font-medium text-primary">"{dishSearch}"</span></span>}
                  {' '}trong bán kính {searchRadius} km
                </p>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  {showMap ? <List className="w-3.5 h-3.5" /> : <MapIcon className="w-3.5 h-3.5" />}
                  {showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}
                </button>
              </div>

              {/* Google Map */}
              {showMap && nearbyStores.length > 0 && (
                <StoreMap
                  stores={nearbyStores}
                  userLocation={userLocation}
                  selectedStoreId={selectedNearbyStore}
                  onSelectStore={setSelectedNearbyStore}
                />
              )}

              {/* Store list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {nearbyStores.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                        <Store className="w-10 h-10 opacity-30" />
                        <p className="text-sm">Không tìm thấy cửa hàng nào gần bạn</p>
                        <p className="text-xs">Thử tăng bán kính hoặc tìm món khác</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="overflow-hidden">
                      <div className="divide-y divide-border">
                        {nearbyStores.map((store, idx) => (
                          <button
                            key={store.id}
                            onClick={() => setSelectedNearbyStore(
                              selectedNearbyStore === store.id ? null : store.id
                            )}
                            className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-secondary/40 transition-colors ${
                              selectedNearbyStore === store.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                            }`}
                          >
                            {/* Number badge */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="font-semibold text-sm text-foreground">{store.name}</span>
                                {store.travel_info && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {store.travel_info.duration_text}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {store.address}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  {store.distance_km} km
                                </span>
                                {store.available_dishes && store.available_dishes.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {store.available_dishes.length} món có sẵn
                                  </span>
                                )}
                                {store.food_items_count > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {store.food_items_count} sản phẩm
                                  </span>
                                )}
                              </div>
                            </div>

                            <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                              selectedNearbyStore === store.id ? 'rotate-90' : ''
                            }`} />
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Store detail panel */}
                <div className="space-y-4">
                  {selectedNearby ? (
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                            {selectedNearby.name[0]}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">{selectedNearby.name}</CardTitle>
                            <p className="text-xs text-emerald-600 font-medium">
                              {selectedNearby.distance_km} km
                              {selectedNearby.travel_info && ` · ${selectedNearby.travel_info.duration_text}`}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                          <span>{selectedNearby.address}</span>
                        </div>
                        {selectedNearby.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 shrink-0 text-green-500" />
                            <a href={`tel:${selectedNearby.phone}`} className="hover:text-foreground hover:underline">
                              {selectedNearby.phone}
                            </a>
                          </div>
                        )}
                        {selectedNearby.operating_hours && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 shrink-0 text-blue-500" />
                            <span>{selectedNearby.operating_hours}</span>
                          </div>
                        )}
                        {selectedNearby.website && (
                          <a
                            href={selectedNearby.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Globe className="w-4 h-4 shrink-0" />
                            Xem website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* Google Maps directions */}
                        {userLocation && (
                          <a
                            href={`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedNearby.latitude},${selectedNearby.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-sm font-medium transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            Chỉ đường trên Google Maps
                          </a>
                        )}

                        {/* Available dishes */}
                        {selectedNearby.available_dishes && selectedNearby.available_dishes.length > 0 && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Món ăn có sẵn ({selectedNearby.available_dishes.length})
                            </p>
                            <div className="space-y-2">
                              {selectedNearby.available_dishes.map(dish => (
                                <div
                                  key={dish.stt}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/40"
                                >
                                  <div className="flex items-center gap-2">
                                    {dish.image_url ? (
                                      <img src={dish.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                                      </div>
                                    )}
                                    <span className="text-xs font-medium">{dish.name}</span>
                                  </div>
                                  {(dish.price_at_store || dish.price_db) && (
                                    <span className="text-xs font-bold text-emerald-600">
                                      {(dish.price_at_store || dish.price_db)?.toLocaleString()}đ
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Travel info */}
                        {selectedNearby.travel_info && (
                          <div className="pt-2 border-t border-border">
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex-1 text-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                <p className="text-muted-foreground">Khoảng cách</p>
                                <p className="font-bold text-blue-600 text-sm">{selectedNearby.travel_info.distance_text}</p>
                              </div>
                              <div className="flex-1 text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                                <p className="text-muted-foreground">Thời gian</p>
                                <p className="font-bold text-amber-600 text-sm">{selectedNearby.travel_info.duration_text}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-2">
                        <Store className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">Chọn cửa hàng trên bản đồ hoặc danh sách</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Mẹo đi chợ */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        Mẹo đi chợ thông minh
                      </CardTitle>
                      <CardDescription className="text-xs">Thực phẩm bổ dưỡng cho mẹ & bé</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {SHOPPING_TIPS.map((tip) => (
                        <div key={tip.label} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors">
                          <span className="text-2xl shrink-0">{tip.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{tip.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{tip.hint}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TẤT CẢ CỬA HÀNG (original) ═══════════ */}
      {activeView === 'stores' && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tổng đối tác', value: total, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Đang hợp tác', value: activeCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Siêu thị', value: stores.filter(s => s.type === 'supermarket').length, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Cửa hàng khác', value: stores.filter(s => s.type !== 'supermarket').length, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 flex items-center gap-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? '—' : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Danh sách cửa hàng */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search & filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm cửa hàng, siêu thị..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'supermarket', 'convenience', 'market', 'online'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                        filterType === type
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {type === 'all' ? 'Tất cả' : STORE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Store className="w-10 h-10 opacity-30" />
                    <p className="text-sm">Chưa có cửa hàng nào</p>
                    <button
                      onClick={fetchStores}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Tải lại
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filtered.map(store => (
                      <button
                        key={store.id}
                        onClick={() => setSelectedStore(selectedStore?.id === store.id ? null : store)}
                        className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-secondary/40 transition-colors ${
                          selectedStore?.id === store.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        {store.logoUrl ? (
                          <img src={store.logoUrl} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {store.name[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{store.name}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STORE_TYPE_COLORS[store.type] || 'bg-gray-100 text-gray-600'}`}>
                              {STORE_TYPE_LABELS[store.type] || store.type}
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              store.isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {store.isActive ? '● Đang mở' : '○ Tạm dừng'}
                            </span>
                          </div>
                          {store.address && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {store.address}
                            </p>
                          )}
                          {store.foodCount !== undefined && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <span className="font-medium text-foreground">{store.foodCount}</span> sản phẩm
                            </p>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                          selectedStore?.id === store.id ? 'rotate-90' : ''
                        }`} />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Cột phải */}
            <div className="space-y-4">
              {selectedStore ? (
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      {selectedStore.logoUrl ? (
                        <img src={selectedStore.logoUrl} alt="" className="w-14 h-14 rounded-2xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                          {selectedStore.name[0]}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{selectedStore.name}</CardTitle>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STORE_TYPE_COLORS[selectedStore.type] || 'bg-gray-100 text-gray-600'}`}>
                          {STORE_TYPE_LABELS[selectedStore.type] || selectedStore.type}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {selectedStore.address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                        <span>{selectedStore.address}</span>
                      </div>
                    )}
                    {selectedStore.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 shrink-0 text-green-500" />
                        <a href={`tel:${selectedStore.phone}`} className="hover:text-foreground hover:underline">
                          {selectedStore.phone}
                        </a>
                      </div>
                    )}
                    {selectedStore.openHours && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 shrink-0 text-blue-500" />
                        <span>{selectedStore.openHours}</span>
                      </div>
                    )}
                    {selectedStore.website && (
                      <a
                        href={selectedStore.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4 shrink-0" />
                        Xem website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Sản phẩm có sẵn</p>
                      <p className="font-bold text-xl text-foreground">{selectedStore.foodCount || 0} món</p>
                    </div>
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                      selectedStore.isActive
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">
                        {selectedStore.isActive ? 'Đang hợp tác — có thể mua hàng' : 'Tạm ngừng hợp tác'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <Store className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Chọn cửa hàng để xem chi tiết</p>
                  </CardContent>
                </Card>
              )}

              {/* Mẹo đi chợ */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Mẹo đi chợ thông minh
                  </CardTitle>
                  <CardDescription className="text-xs">Thực phẩm bổ dưỡng cho mẹ & bé</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {SHOPPING_TIPS.map((tip) => (
                    <div key={tip.label} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors">
                      <span className="text-2xl shrink-0">{tip.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{tip.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tip.hint}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
