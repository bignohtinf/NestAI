'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layouts/main-layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, Plus, Trash2, Heart, Mail, Phone, Sparkles } from 'lucide-react';

const PREDEFINED_ALLERGIES = [
  'Hải sản', 'Đậu phộng', 'Các loại hạt', 'Sữa bò', 'Trứng', 'Đậu nành', 'Lúa mì (Gluten)'
];

const PREDEFINED_DISLIKES = [
  'Đồ cay', 'Đồ sống/tái', 'Hành/Tỏi', 'Rau mùi', 'Đồ nhiều dầu mỡ', 'Đồ quá ngọt'
];
export default function ProfilePage() {
  return (
    <Suspense fallback={<MainLayout><div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div></MainLayout>}>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const { user, isLoading, fetchUserData } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [babies, setBabies] = useState<any[]>([]);
  const [loadingBabies, setLoadingBabies] = useState(true);
  const [isAddingBaby, setIsAddingBaby] = useState(false);

  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [condition, setCondition] = useState('none');
  const [foodPreference, setFoodPreference] = useState('no_pref');
  const [initialData, setInitialData] = useState({ phone: '', dob: '', allergies: [] as string[], dislikes: [] as string[], condition: 'none', foodPreference: 'no_pref' });

  const [activePartnership, setActivePartnership] = useState<{
    id: string;
    partner: { full_name: string; email: string; phone?: string; role: string } | null;
  } | null>(null);
  const [loadingPartnership, setLoadingPartnership] = useState(true);

  const [partnerData, setPartnerData] = useState({
    partnerEmail: '',
    partnerPhone: '',
  });

  const [babyData, setBabyData] = useState({
    name: '',
    status: 'born' as 'born' | 'pregnant', // 'born' = đã sinh, 'pregnant' = mang bầu
    dateOfBirth: '', // Khi đã sinh
    gestationWeeks: '', // Khi mang bầu (tuần thai)
    gender: 'male' as 'male' | 'female',
    weightAtBirth: '',
    heightAtBirth: '',
    bloodType: '',
    notes: '',
  });

  const [medicalProfile, setMedicalProfile] = useState({
    pregnancyStatus: 'not_pregnant',
    lastMenstrualPeriod: '',
    dueDate: '',
    currentWeightKg: '',
  });
  const [loadingMedical, setLoadingMedical] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/me?user_id=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.phone) setPhone(data.phone);
        if (data.dob) setDob(data.dob);
        if (data.allergies) setAllergies(data.allergies);
        if (data.dislikes) setDislikes(data.dislikes);
        if (data.condition) setCondition(data.condition);
        if (data.food_preference) setFoodPreference(data.food_preference);
        setInitialData({
          phone: data.phone || '',
          dob: data.dob || '',
          allergies: data.allergies || [],
          dislikes: data.dislikes || [],
          condition: data.condition || 'none',
          foodPreference: data.food_preference || 'no_pref'
        });
      })
      .catch(() => { });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingPartnership(true);
    fetch(`/api/partnerships/active?user_id=${user.id}`)
      .then((r) => r.json())
      .then((data) => setActivePartnership(data.partnership || null))
      .catch(() => setActivePartnership(null))
      .finally(() => setLoadingPartnership(false));
  }, [user?.id]);

  const fetchBabies = async () => {
    try {
      setLoadingBabies(true);
      const response = await fetch(`/api/babies/?user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBabies(data.babies || []);
      }
    } catch (err) {
      console.error('Failed to fetch babies:', err);
    } finally {
      setLoadingBabies(false);
    }
  };

  const fetchMedicalProfile = async () => {
    if (!user?.id) return;
    try {
      setLoadingMedical(true);
      const res = await fetch(`/api/medical-profile/me?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setMedicalProfile({
            pregnancyStatus: data.profile.pregnancy_status || 'not_pregnant',
            lastMenstrualPeriod: data.profile.last_menstrual_period || '',
            dueDate: data.profile.due_date || '',
            currentWeightKg: data.profile.current_weight_kg || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch medical profile:', err);
    } finally {
      setLoadingMedical(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBabies();
      fetchMedicalProfile();
    }
  }, [user?.id]);

  if (isLoading || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const handlePartnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartnerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBabyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBabyData((prev) => ({
      ...prev,
      [name]: name === 'weightAtBirth' || name === 'heightAtBirth' ? parseFloat(value) || '' : value,
    }));
  };

  const isDirty =
    phone !== initialData.phone ||
    dob !== initialData.dob ||
    condition !== initialData.condition ||
    foodPreference !== initialData.foodPreference ||
    JSON.stringify([...allergies].sort()) !== JSON.stringify([...initialData.allergies].sort()) ||
    JSON.stringify([...dislikes].sort()) !== JSON.stringify([...initialData.dislikes].sort());

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/me?user_id=${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, dob, allergies, dislikes, condition, food_preference: foodPreference }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công' });
        setInitialData({ phone, dob, allergies, dislikes, condition, foodPreference });
        fetchUserData(); // Refresh context so dashboard hides banner
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Không thể cập nhật thông tin');
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Đã xảy ra lỗi',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!partnerData.partnerEmail && !partnerData.partnerPhone) {
        throw new Error('Vui lòng nhập email hoặc số điện thoại của bạn đời');
      }

      const response = await fetch('/api/partnerships/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerEmail: partnerData.partnerEmail,
          partnerPhone: partnerData.partnerPhone,
          fatherId: user?.id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Gửi yêu cầu kết nối thành công' });
        setPartnerData({ partnerEmail: '', partnerPhone: '' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(result.message || 'Không thể gửi yêu cầu');
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Đã xảy ra lỗi',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBaby = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!babyData.name) {
        throw new Error('Vui lòng nhập tên bé');
      }

      if (babyData.status === 'born' && !babyData.dateOfBirth) {
        throw new Error('Vui lòng nhập ngày sinh của bé');
      }

      if (babyData.status === 'pregnant' && !babyData.gestationWeeks) {
        throw new Error('Vui lòng nhập tuần thai');
      }

      const response = await fetch(`/api/babies/?user_id=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: babyData.name,
          status: babyData.status,
          date_of_birth: babyData.status === 'born' ? babyData.dateOfBirth : null,
          gestation_weeks: babyData.status === 'pregnant' ? parseInt(babyData.gestationWeeks) : null,
          gender: babyData.gender,
          weight_at_birth: babyData.weightAtBirth ? parseFloat(babyData.weightAtBirth) : null,
          height_at_birth: babyData.heightAtBirth ? parseFloat(babyData.heightAtBirth) : null,
          blood_type: babyData.bloodType || null,
          notes: babyData.notes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBabies([...babies, data.data]);
        setBabyData({
          name: '',
          status: 'born',
          dateOfBirth: '',
          gestationWeeks: '',
          gender: 'male',
          weightAtBirth: '',
          heightAtBirth: '',
          bloodType: '',
          notes: '',
        });
        setMessage({ type: 'success', text: 'Thêm bé thành công' });
        setTimeout(() => setMessage(null), 3000);
        fetchUserData();
        setIsAddingBaby(false);
      } else {
        throw new Error('Không thể thêm bé');
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Đã xảy ra lỗi',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBaby = async (babyId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bé này?')) return;

    try {
      const response = await fetch(`/api/babies/${babyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBabies(babies.filter((b) => b.id !== babyId));
        setMessage({ type: 'success', text: 'Xóa bé thành công' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Không thể xóa bé');
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Đã xảy ra lỗi',
      });
    }
  };

  const handleUpdateMedicalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/medical-profile/me?user_id=${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregnancy_status: medicalProfile.pregnancyStatus,
          last_menstrual_period: medicalProfile.lastMenstrualPeriod || null,
          due_date: medicalProfile.dueDate || null,
          current_weight_kg: medicalProfile.currentWeightKg ? parseFloat(medicalProfile.currentWeightKg) : null,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Cập nhật hồ sơ thai kỳ thành công' });
        setTimeout(() => setMessage(null), 3000);
        fetchUserData(); // Refresh global context
        fetchMedicalProfile(); // Refresh local state
      } else {
        throw new Error('Không thể cập nhật hồ sơ thai kỳ');
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Đã xảy ra lỗi',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Trang cá nhân</h1>
          <p className="text-muted-foreground mt-1 text-sm">Quản lý thông tin cá nhân, mối quan hệ và bé</p>
        </div>
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <TabsList className="w-full flex overflow-x-auto gap-1 h-auto p-1 sm:grid sm:gap-0 sm:h-10 sm:p-0.5"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            <TabsTrigger value="profile" className="shrink-0 sm:shrink text-xs sm:text-sm">Cá nhân</TabsTrigger>
            <TabsTrigger value="partnership" className="shrink-0 sm:shrink text-xs sm:text-sm">Quan hệ</TabsTrigger>
            <TabsTrigger value="babies" className="shrink-0 sm:shrink text-xs sm:text-sm whitespace-nowrap">Thai nhi / Bé</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Thông tin tài khoản của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <p className="px-3 py-2 rounded-md bg-muted text-sm">{user.name}</p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="px-3 py-2 rounded-md bg-muted text-sm">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <p className="px-3 py-2 rounded-md bg-muted text-sm">
                    {user.role === 'mother' ? 'Mẹ' : user.role === 'father' ? 'Bố' : 'Quản trị viên'}
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      placeholder="+84 9xx xxx xxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Ngày tháng năm sinh</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dị ứng (tùy chọn)</Label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_ALLERGIES.map(item => (
                        <div
                          key={item}
                          onClick={() => setAllergies(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                          className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border transition-colors ${allergies.includes(item) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Món không thích (tùy chọn)</Label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_DISLIKES.map(item => (
                        <div
                          key={item}
                          onClick={() => setDislikes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
                          className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border transition-colors ${dislikes.includes(item) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Tình trạng sức khỏe</Label>
                    <select
                      id="condition"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="none">Bình thường</option>
                      <option value="gdm">Tiểu đường thai kỳ</option>
                      <option value="anemia">Thiếu máu / Thiếu sắt</option>
                      <option value="hypertension">Cao huyết áp thai kỳ</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foodPreference">Hạn chế ăn uống</Label>
                    <Input
                      id="foodPreference"
                      value={foodPreference}
                      onChange={(e) => setFoodPreference(e.target.value)}
                      disabled={loading}
                      placeholder="VD: Không ăn rau mầm, không ăn cá thu..."
                    />
                  </div>

                  <Button type="submit" disabled={loading || !isDirty} className="w-full">
                    {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partnership Tab */}
          <TabsContent value="partnership">
            {loadingPartnership ? (
              <Card>
                <CardContent className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </CardContent>
              </Card>
            ) : activePartnership ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Mối quan hệ gia đình
                  </CardTitle>
                  <CardDescription>Đã kết nối với {user.role === 'mother' ? 'bố' : 'mẹ'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Họ và tên</Label>
                      <p className="font-semibold">{activePartnership.partner?.full_name || 'Chưa có tên'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{activePartnership.partner?.email}</span>
                    </div>
                    {activePartnership.partner?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{activePartnership.partner.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Kết nối gia đình</CardTitle>
                  <CardDescription>
                    {user.role === 'father'
                      ? 'Nhập thông tin của mẹ để gửi yêu cầu kết nối'
                      : 'Nhập thông tin của bố để gửi yêu cầu kết nối'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePartnership} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnerEmail">
                        Email của {user.role === 'father' ? 'mẹ' : 'bố'}
                      </Label>
                      <Input
                        id="partnerEmail"
                        name="partnerEmail"
                        type="email"
                        value={partnerData.partnerEmail}
                        onChange={handlePartnerChange}
                        disabled={loading}
                        placeholder="partner@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerPhone">
                        Hoặc số điện thoại của {user.role === 'father' ? 'mẹ' : 'bố'}
                      </Label>
                      <Input
                        id="partnerPhone"
                        name="partnerPhone"
                        type="tel"
                        value={partnerData.partnerPhone}
                        onChange={handlePartnerChange}
                        disabled={loading}
                        placeholder="+84 9xx xxx xxx"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.role === 'father'
                        ? 'Mẹ sẽ nhận được yêu cầu kết nối trong tab Thông báo'
                        : 'Bố sẽ nhận được yêu cầu kết nối trong tab Thông báo'}
                    </p>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Đang gửi...' : 'Gửi yêu cầu kết nối'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Babies Tab */}
          <TabsContent value="babies" className="space-y-6">
            {/* Pregnancy Profile Section (Only for mothers) */}
            {user.role === 'mother' && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    Hồ sơ thai kỳ (Dành cho mẹ)
                  </CardTitle>
                  <CardDescription>Cài đặt để hệ thống tự động tính toán tuần thai và ngày dự sinh</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateMedicalProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tình trạng</Label>
                        <select
                          value={medicalProfile.pregnancyStatus}
                          onChange={(e) => setMedicalProfile(prev => ({ ...prev, pregnancyStatus: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        >
                          <option value="not_pregnant">Chưa mang thai</option>
                          <option value="pregnant">Đang mang thai</option>
                          <option value="postpartum">Sau sinh</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Cân nặng hiện tại (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={medicalProfile.currentWeightKg}
                          onChange={(e) => setMedicalProfile(prev => ({ ...prev, currentWeightKg: e.target.value }))}
                          placeholder="60.5"
                        />
                      </div>
                    </div>

                    {medicalProfile.pregnancyStatus === 'pregnant' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-primary/10">
                        <div className="space-y-2">
                          <Label>Ngày kinh cuối (LMP)</Label>
                          <Input
                            type="date"
                            value={medicalProfile.lastMenstrualPeriod}
                            onChange={(e) => setMedicalProfile(prev => ({ ...prev, lastMenstrualPeriod: e.target.value }))}
                          />
                          <p className="text-[10px] text-muted-foreground">Hệ thống sẽ tự tính tuần thai dựa trên ngày này</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Hoặc Ngày dự sinh (EDD)</Label>
                          <Input
                            type="date"
                            value={medicalProfile.dueDate}
                            onChange={(e) => setMedicalProfile(prev => ({ ...prev, dueDate: e.target.value }))}
                          />
                          <p className="text-[10px] text-muted-foreground">Nhập nếu bạn đã có ngày dự sinh từ bác sĩ</p>
                        </div>
                      </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Đang lưu...' : 'Lưu hồ sơ thai kỳ'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="pt-2 border-t">
              <h3 className="font-bold text-lg mb-4">Danh sách các bé</h3>
            {loadingBabies ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Đang tải danh sách bé...</p>
              </div>
            ) : babies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chưa có bé nào. Hãy thêm bé mới!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {babies.map((baby) => (
                  <Card key={baby.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{baby.name}</h3>
                          {baby.date_of_birth ? (
                            <p className="text-sm text-muted-foreground">
                              Ngày sinh: {new Date(baby.date_of_birth).toLocaleDateString('vi-VN')}
                            </p>
                          ) : baby.gestation_weeks ? (
                            <p className="text-sm text-muted-foreground">
                              Tuần thai: {baby.gestation_weeks} tuần
                            </p>
                          ) : null}
                          {baby.weight_at_birth && (
                            <p className="text-sm text-muted-foreground">
                              Cân nặng: {baby.weight_at_birth} kg
                            </p>
                          )}
                          {baby.height_at_birth && (
                            <p className="text-sm text-muted-foreground">
                              Chiều cao: {baby.height_at_birth} cm
                            </p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBaby(baby.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isAddingBaby ? (
              <Button
                onClick={() => setIsAddingBaby(true)}
                className="w-full border border-border/60"
                variant="secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm bé mới
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Thêm bé mới</CardTitle>
                  <CardDescription>Nhập thông tin của bé</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBaby} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Tên bé</Label>
                        <Input
                          id="name"
                          name="name"
                          value={babyData.name}
                          onChange={handleBabyChange}
                          disabled={loading}
                          placeholder="Tên bé"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Tình trạng</Label>
                        <select
                          id="status"
                          name="status"
                          value={babyData.status}
                          onChange={handleBabyChange}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="born">Đã sinh</option>
                          <option value="pregnant">Mang bầu</option>
                        </select>
                      </div>
                    </div>

                    {babyData.status === 'born' ? (
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={babyData.dateOfBirth}
                          onChange={handleBabyChange}
                          disabled={loading}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="gestationWeeks">Tuần thai</Label>
                        <Input
                          id="gestationWeeks"
                          name="gestationWeeks"
                          type="number"
                          min="0"
                          max="42"
                          value={babyData.gestationWeeks}
                          onChange={handleBabyChange}
                          disabled={loading}
                          placeholder="Nhập tuần thai (0-42)"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <select
                          id="gender"
                          name="gender"
                          value={babyData.gender}
                          onChange={handleBabyChange}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Nhóm máu</Label>
                        <Input
                          id="bloodType"
                          name="bloodType"
                          value={babyData.bloodType}
                          onChange={handleBabyChange}
                          disabled={loading}
                          placeholder="O+"
                        />
                      </div>
                    </div>

                    {babyData.status === 'born' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weightAtBirth">Cân nặng lúc sinh (kg)</Label>
                          <Input
                            id="weightAtBirth"
                            name="weightAtBirth"
                            type="number"
                            step="0.1"
                            value={babyData.weightAtBirth}
                            onChange={handleBabyChange}
                            disabled={loading}
                            placeholder="3.5"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="heightAtBirth">Chiều cao lúc sinh (cm)</Label>
                          <Input
                            id="heightAtBirth"
                            name="heightAtBirth"
                            type="number"
                            step="0.1"
                            value={babyData.heightAtBirth}
                            onChange={handleBabyChange}
                            disabled={loading}
                            placeholder="50"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi chú</Label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={babyData.notes}
                        onChange={handleBabyChange}
                        disabled={loading}
                        placeholder="Ghi chú thêm về bé"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1 border border-border/60"
                        onClick={() => setIsAddingBaby(false)}
                        disabled={loading}
                      >
                        Hủy bỏ
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        {loading ? 'Đang thêm...' : 'Thêm bé'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
