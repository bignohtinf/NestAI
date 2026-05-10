'use client';

import { useState, useEffect } from 'react';
import {
  Globe, Plus, Search, MapPin, Phone, ExternalLink, Loader2,
  MoreVertical, Edit3, Trash2, X, Save, CheckCircle2,
  AlertCircle, ChevronLeft, ChevronRight, Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

interface StoreData {
  id?: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  latitude: number | null;
  longitude: number | null;
  operating_hours: string;
  status: string;
}

const EMPTY_STORE: StoreData = {
  name: '', description: '', phone: '', email: '', website: '',
  address: '', city: 'Hà Nội', district: '', ward: '',
  latitude: null, longitude: null, operating_hours: '', status: 'active',
};

const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khác'];

// ── Store Form Modal ─────────────────────────────────────────────────────────

function StoreFormModal({
  store,
  onClose,
  onSaved,
}: {
  store: StoreData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!store?.id;
  const [form, setForm] = useState<StoreData>(store || { ...EMPTY_STORE });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof StoreData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Tên, địa chỉ và thành phố là bắt buộc');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        address: form.address,
        city: form.city,
        district: form.district || null,
        ward: form.ward || null,
        latitude: form.latitude,
        longitude: form.longitude,
        operating_hours: form.operating_hours || null,
        status: form.status,
      };

      if (isEdit) {
        await adminApi.updateStore(store!.id!, payload);
      } else {
        await adminApi.createStore(payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu cửa hàng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Tên cửa hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="VD: WinMart+ Trần Duy Hưng"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Trạng thái</label>
              <select
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Tạm dừng</option>
                <option value="suspended">Đình chỉ</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Mô tả</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Mô tả ngắn về cửa hàng..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              placeholder="15 Trần Duy Hưng, Trung Hoà, Cầu Giấy, Hà Nội"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* City, District, Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Quận/Huyện</label>
              <input
                type="text" value={form.district}
                onChange={e => handleChange('district', e.target.value)}
                placeholder="Cầu Giấy"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Phường/Xã</label>
              <input
                type="text" value={form.ward}
                onChange={e => handleChange('ward', e.target.value)}
                placeholder="Trung Hoà"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lat, Lng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Vĩ độ (Latitude)</label>
              <input
                type="number" step="any"
                value={form.latitude ?? ''}
                onChange={e => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="21.0285"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Kinh độ (Longitude)</label>
              <input
                type="number" step="any"
                value={form.longitude ?? ''}
                onChange={e => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="105.8542"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Số điện thoại</label>
              <input
                type="text" value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="024-3556-7890"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
              <input
                type="email" value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="store@example.com"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Website + Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Website</label>
              <input
                type="url" value={form.website}
                onChange={e => handleChange('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Giờ hoạt động</label>
              <input
                type="text" value={form.operating_hours}
                onChange={e => handleChange('operating_hours', e.target.value)}
                placeholder="07:00 - 22:00"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  storeName,
  onConfirm,
  onCancel,
  deleting,
}: {
  storeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Xác nhận xóa</h3>
            <p className="text-xs text-gray-500">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
          Bạn có chắc muốn xóa cửa hàng <span className="font-semibold text-red-600">"{storeName}"</span>?
          Tất cả liên kết món ăn với cửa hàng này cũng sẽ bị xóa.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 20;

  // Modal state
  const [formModal, setFormModal] = useState<StoreData | null | false>(false);
  const [deleteModal, setDeleteModal] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch
  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStores({
        limit: pageSize,
        offset: page * pageSize,
        search: searchTerm,
        status: statusFilter || undefined,
      });
      setStores(data.stores || data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, page, statusFilter]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Close action menu on click outside
  useEffect(() => {
    if (actionMenuId) {
      const handler = () => setActionMenuId(null);
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [actionMenuId]);

  // Handlers
  const handleSaved = () => {
    setFormModal(false);
    setToast({ type: 'success', message: 'Đã lưu cửa hàng thành công!' });
    fetchStores();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await adminApi.deleteStore(deleteModal.id);
      setToast({ type: 'success', message: `Đã xóa "${deleteModal.name}"` });
      setDeleteModal(null);
      fetchStores();
    } catch (err) {
      setToast({ type: 'error', message: 'Lỗi khi xóa cửa hàng' });
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (store: any) => {
    setFormModal({
      id: store.id,
      name: store.name || '',
      description: store.description || '',
      phone: store.phone || '',
      email: store.email || '',
      website: store.website || '',
      address: store.address || '',
      city: store.city || 'Hà Nội',
      district: store.district || '',
      ward: store.ward || '',
      latitude: store.latitude ?? null,
      longitude: store.longitude ?? null,
      operating_hours: store.operating_hours || store.operatingHours || '',
      status: store.status || 'active',
    });
    setActionMenuId(null);
  };

  const totalPages = Math.ceil(total / pageSize);
  const activeCount = stores.filter(s => s.status === 'active' || s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${
          toast.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/40 dark:border-green-800 dark:text-green-400'
            : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-500" />
            Danh sách cửa hàng/Siêu thị
          </h1>
          <p className="text-gray-500 mt-2">
            Quản lý mạng lưới đối tác cung cấp thực phẩm — {total} cửa hàng
          </p>
        </div>
        <button
          onClick={() => setFormModal({ ...EMPTY_STORE })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-shadow text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Thêm đối tác
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng cửa hàng', value: total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Đang hợp tác', value: activeCount, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Trang hiện tại', value: `${page + 1}/${totalPages || 1}`, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
          { label: 'Hiển thị', value: `${stores.length}/${total}`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hợp tác</option>
          <option value="inactive">Tạm dừng</option>
          <option value="suspended">Đình chỉ</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border-gray-200 dark:border-gray-800 overflow-hidden relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Đối tác</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Khu vực</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Liên hệ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Tọa độ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Món ăn</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {(!stores || stores.length === 0) && !loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500 italic">
                      Chưa có đối tác nào trong danh sách
                    </td>
                  </tr>
                ) : (
                  stores.map(store => {
                    const isActive = store.status === 'active' || store.isActive;
                    const hasCoords = store.latitude != null && store.longitude != null;
                    return (
                      <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                              {store.name?.[0] || '?'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{store.name}</div>
                              <div className="text-[10px] text-gray-500 truncate max-w-[200px] flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                {store.address || 'Chưa có địa chỉ'}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Area */}
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <div className="font-medium text-gray-700 dark:text-gray-300">{store.city || '—'}</div>
                            <div className="text-gray-500">{store.district || ''}</div>
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-4 py-3">
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                              <Phone className="w-3 h-3 shrink-0" />
                              {store.phone || 'N/A'}
                            </div>
                            {store.website && (
                              <a href={store.website} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline">
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                Website
                              </a>
                            )}
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : store.status === 'suspended'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {isActive ? 'Hợp tác' : store.status === 'suspended' ? 'Đình chỉ' : 'Tạm dừng'}
                          </span>
                        </td>
                        {/* Coords */}
                        <td className="px-4 py-3">
                          {hasCoords ? (
                            <span className="text-[10px] text-gray-500 font-mono">
                              {store.latitude?.toFixed(4)}, {store.longitude?.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-medium">Chưa có</span>
                          )}
                        </td>
                        {/* Food count */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {store.foodItemsCount ?? store.food_items_count ?? store.foodCount ?? 0}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setActionMenuId(actionMenuId === store.id ? null : store.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown */}
                          {actionMenuId === store.id && (
                            <div className="absolute right-4 top-full mt-1 z-30 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                              onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => openEdit(store)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                              </button>
                              <button
                                onClick={() => { setDeleteModal(store); setActionMenuId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Hiển thị {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} / {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 text-xs rounded-lg font-medium ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {formModal !== false && (
        <StoreFormModal
          store={formModal}
          onClose={() => setFormModal(false)}
          onSaved={handleSaved}
        />
      )}

      {deleteModal && (
        <DeleteConfirmModal
          storeName={deleteModal.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
