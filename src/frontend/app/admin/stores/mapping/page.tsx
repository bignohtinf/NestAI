'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Link as LinkIcon,
  Search,
  Package,
  Loader2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Store,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface MappingItem {
  id: string;
  store_id: string;
  dish_stt: number;
  store_name?: string;
  dish_name?: string;
  price_at_store?: number;
  availability: boolean;
  notes?: string;
  updated_at: string;
}

interface StoreOption {
  id: string;
  name: string;
  city?: string;
}

interface DishOption {
  stt: number;
  dish_name_vi: string;
  dish_name_en?: string;
  price_vnd?: number;
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm
        ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
        {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        {message}
        <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ── Add Mapping Modal ────────────────────────────────────────────────────────
function AddMappingModal({
  stores,
  onClose,
  onSave,
}: {
  stores: StoreOption[];
  onClose: () => void;
  onSave: (data: { store_id: string; dish_stt: number; price_at_store?: number; availability: boolean }) => void;
}) {
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || '');
  const [dishSearch, setDishSearch] = useState('');
  const [dishResults, setDishResults] = useState<DishOption[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishOption | null>(null);
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState(true);
  const [searchingDish, setSearchingDish] = useState(false);
  const [saving, setSaving] = useState(false);

  // Debounced dish search
  useEffect(() => {
    if (dishSearch.length < 2) { setDishResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setSearchingDish(true);
        const res = await adminApi.getNutritionDatabase({ search: dishSearch, limit: 10 });
        setDishResults(res.items || []);
      } catch { setDishResults([]); }
      finally { setSearchingDish(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [dishSearch]);

  const handleSubmit = async () => {
    if (!selectedStoreId || !selectedDish) return;
    setSaving(true);
    try {
      onSave({
        store_id: selectedStoreId,
        dish_stt: selectedDish.stt,
        price_at_store: price ? parseFloat(price) : undefined,
        availability,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold">Thêm liên kết mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Store select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cửa hàng</label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.city ? ` (${s.city})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Dish search */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Món ăn</label>
            {selectedDish ? (
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800">
                <Package className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium flex-1">{selectedDish.dish_name_vi}</span>
                {selectedDish.price_vnd && (
                  <span className="text-xs text-gray-500">{selectedDish.price_vnd.toLocaleString()}d</span>
                )}
                <button onClick={() => { setSelectedDish(null); setDishSearch(''); }} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  placeholder="Gõ tên món ăn để tìm..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchingDish && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" />}
                {dishResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {dishResults.map((d) => (
                      <button
                        key={d.stt}
                        onClick={() => {
                          setSelectedDish(d);
                          setDishResults([]);
                          if (d.price_vnd && !price) setPrice(String(d.price_vnd));
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex justify-between items-center"
                      >
                        <span>{d.dish_name_vi}</span>
                        {d.price_vnd && <span className="text-xs text-gray-400">{d.price_vnd.toLocaleString()}d</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Gia tai cua hang (VND)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="De trong neu dung gia goc"
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="avail"
              checked={availability}
              onChange={(e) => setAvailability(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="avail" className="text-sm">Con hang</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            Huy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedStoreId || !selectedDish || saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Tao lien ket
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({
  mapping,
  onClose,
  onConfirm,
}: {
  mapping: MappingItem;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm">
        <div className="p-6 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Xoa lien ket?</h3>
          <p className="text-sm text-gray-500">
            Xoa lien ket giua <strong>{mapping.dish_name || `Dish #${mapping.dish_stt}`}</strong> va{' '}
            <strong>{mapping.store_name || 'cua hang'}</strong>? Hanh dong nay khong the hoan tac.
          </p>
        </div>
        <div className="flex gap-3 p-4 border-t dark:border-gray-800">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            Huy
          </button>
          <button
            onClick={async () => {
              setDeleting(true);
              await onConfirm();
              setDeleting(false);
            }}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Xoa
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StoreMappingPage() {
  const [mappings, setMappings] = useState<MappingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterStoreId, setFilterStoreId] = useState('');

  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storesLoaded, setStoresLoaded] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MappingItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const LIMIT = 15;

  // Load store list for dropdown
  useEffect(() => {
    async function loadStores() {
      try {
        const res = await adminApi.getStores({ limit: 100, status: 'active' });
        setStores((res.stores || []).map((s: any) => ({ id: s.id, name: s.name, city: s.city })));
      } catch (err) {
        console.error('Failed to load stores:', err);
      } finally {
        setStoresLoaded(true);
      }
    }
    loadStores();
  }, []);

  // Load mappings
  const fetchMappings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStoreMappings({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        storeId: filterStoreId || undefined,
      });
      setMappings(res.mappings || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch mappings:', err);
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStoreId]);

  useEffect(() => { fetchMappings(); }, [fetchMappings]);

  // Search handler
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // Add mapping
  const handleAddMapping = async (data: { store_id: string; dish_stt: number; price_at_store?: number; availability: boolean }) => {
    try {
      await adminApi.addStoreMapping(data);
      setToast({ message: 'Da tao lien ket thanh cong!', type: 'success' });
      setShowAddModal(false);
      fetchMappings();
    } catch (err: any) {
      setToast({ message: err?.message || 'Loi khi tao lien ket', type: 'error' });
    }
  };

  // Delete mapping
  const handleDeleteMapping = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteStoreMapping(deleteTarget.id);
      setToast({ message: 'Da xoa lien ket!', type: 'success' });
      setDeleteTarget(null);
      fetchMappings();
    } catch (err: any) {
      setToast({ message: err?.message || 'Loi khi xoa', type: 'error' });
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  // Filter displayed mappings by local search
  const displayedMappings = search
    ? mappings.filter(
        (m) =>
          (m.dish_name || '').toLowerCase().includes(search.toLowerCase()) ||
          (m.store_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : mappings;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showAddModal && (
        <AddMappingModal stores={stores} onClose={() => setShowAddModal(false)} onSave={handleAddMapping} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal mapping={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteMapping} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LinkIcon className="h-8 w-8 text-indigo-500" />
            Lien ket Mon an - Cua hang
          </h1>
          <p className="text-gray-500 mt-1">Quan ly thuc pham co san tai cac he thong sieu thi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Them lien ket
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-gray-500">Tong lien ket</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stores.length}</p>
                <p className="text-xs text-gray-500">Cua hang hoat dong</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {displayedMappings.filter((m) => m.availability).length}/{displayedMappings.length}
                </p>
                <p className="text-xs text-gray-500">Con hang (trang nay)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tim theo ten mon an hoac cua hang..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterStoreId}
          onChange={(e) => { setFilterStoreId(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
        >
          <option value="">Tat ca cua hang</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
        >
          Tim
        </button>
      </div>

      {/* Table */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-sm text-gray-500">Dang tai...</span>
            </div>
          ) : displayedMappings.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Chua co lien ket nao</p>
              <p className="text-gray-400 text-sm mt-1">Nhan &quot;Them lien ket&quot; de bat dau</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Mon an</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Cua hang</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Gia (VND)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trang thai</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Thao tac</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {displayedMappings.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <div className="font-medium">{m.dish_name || `Dish #${m.dish_stt}`}</div>
                            <div className="text-xs text-gray-400">STT: {m.dish_stt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {m.store_name || m.store_id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {m.price_at_store ? `${m.price_at_store.toLocaleString()}d` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
                          ${m.availability
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {m.availability ? (
                            <><CheckCircle2 className="w-3 h-3" /> Con hang</>
                          ) : (
                            <><XCircle className="w-3 h-3" /> Het hang</>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Xoa lien ket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-800">
              <span className="text-sm text-gray-500">
                Hien thi {(page - 1) * LIMIT + 1}-{Math.min(page * LIMIT, total)} / {total} lien ket
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium
                        ${page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
