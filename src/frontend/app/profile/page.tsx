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
import { AlertCircle, CheckCircle, Plus, Trash2, Heart, Mail, Phone, Sparkles, Pencil, X, User } from 'lucide-react';
import { formatGestationAge, calculateGestationAge } from '@/lib/utils';

const PREDEFINED_ALLERGIES = [
  'Hải sản', 'Đậu phộng', 'Các loại hạt', 'Sữa bò', 'Trứng', 'Đậu nành', 'Lúa mì (Gluten)'
];

const PREDEFINED_DISLIKES = [
  'Đồ cay', 'Đồ sống/tái', 'Hành/Tỏi', 'Rau mùi', 'Đồ nhiều dầu mỡ', 'Đồ quá ngọt'
];
function ProfilePageInner() {
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
  const [editingBabyId, setEditingBabyId] = useState<string | null>(null);
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
    status: 'pregnant' as 'born' | 'pregnant', // 'pregnant' = đang mang thai, 'born' = đã sinh
    dateOfBirth: '',   // Khi đã sinh (cập nhật sau)
    lmp: '',           // Last Menstrual Period — nguồn tính tuần thai
    edd: '',           // Expected Due Date — nguồn tính tuần thai (thay thế nếu không có LMP)
    gender: '' as '' | 'male' | 'female',
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
          requesterId: user?.id, // Cả mẹ và bố đều có thể gửi — backend tự xác định role
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

      if (babyData.status === 'pregnant' && !babyData.lmp && !babyData.edd) {
        throw new Error('Vui lòng nhập Ngày kinh cuối (LMP) hoặc Ngày dự sinh (EDD) để tính tuần thai');
      }

      const response = await fetch(`/api/babies/?user_id=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: babyData.name,
          status: babyData.status,
          date_of_birth: babyData.status === 'born' ? babyData.dateOfBirth : null,
          // Tuần thai sẽ được tính live từ lmp/edd — không gửi gestation_weeks
          lmp: babyData.status === 'pregnant' && babyData.lmp ? babyData.lmp : null,
          edd: babyData.status === 'pregnant' && babyData.edd ? babyData.edd : null,
          gender: babyData.gender || null,
          weight_at_birth: babyData.status === 'born' && babyData.weightAtBirth ? parseFloat(babyData.weightAtBirth) : null,
          height_at_birth: babyData.status === 'born' && babyData.heightAtBirth ? parseFloat(babyData.heightAtBirth) : null,
          blood_type: babyData.bloodType || null,
          notes: babyData.notes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newBaby = data.data;
        console.log('New baby created:', newBaby);
        
        if (newBaby && newBaby.id) {
          setBabies(prev => [...prev, newBaby]);
        } else {
          console.warn('Baby created but ID is missing in response, re-fetching list...');
          fetchBabies();
        }

        // Reset form data
        setBabyData({
          name: '',
          status: 'pregnant',
          dateOfBirth: '',
          lmp: '',
          edd: '',
          gender: '',
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
    console.log('DEBUG DELETE:', {
      value: babyId,
      type: typeof babyId,
      length: String(babyId).length,
      isUndefinedString: babyId === "undefined",
      isEmpty: !babyId
    });
    
    if (!babyId || String(babyId).trim() === "undefined" || babyId === "null") {
      setMessage({ type: 'error', text: `Không tìm thấy ID hợp lệ (Giá trị: ${babyId})` });
      return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa bé này?')) return;

    try {
      const response = await fetch(`/api/babies/${babyId}?user_id=${user?.id}`, {
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

  const handleUpdateBaby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBabyId) return;
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/babies/${editingBabyId}?user_id=${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: babyData.name,
          gender: babyData.gender || null,
          // Chỉ gửi lmp/edd — tuần thai tính live ở backend, không lưu gestation_weeks
          lmp: babyData.status === 'pregnant' && babyData.lmp ? babyData.lmp : null,
          edd: babyData.status === 'pregnant' && babyData.edd ? babyData.edd : null,
          date_of_birth: babyData.status === 'born' && babyData.dateOfBirth ? babyData.dateOfBirth : null,
          weight_at_birth: babyData.weightAtBirth ? parseFloat(babyData.weightAtBirth) : null,
          height_at_birth: babyData.heightAtBirth ? parseFloat(babyData.heightAtBirth) : null,
          blood_type: babyData.bloodType || null,
          notes: babyData.notes || null,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        // Cập nhật local state
        setBabies(babies.map(b => b.id === editingBabyId ? updated.data : b));
        setEditingBabyId(null);
        setBabyData({
          name: '',
          status: 'pregnant',
          dateOfBirth: '',
          lmp: '',
          edd: '',
          gender: '',
          weightAtBirth: '',
          heightAtBirth: '',
          bloodType: '',
          notes: '',
        });
        setMessage({ type: 'success', text: 'Cập nhật thông tin bé thành công' });
        setTimeout(() => setMessage(null), 3000);
        // Đồng bộ lại context nếu là thai kỳ
        if (updated.data.status === 'pregnant') {
          fetchUserData();
        }
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Không thể cập nhật thông tin bé');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Đã xảy ra lỗi' });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (baby: any) => {
    setEditingBabyId(baby.id);
    setBabyData({
      name: baby.name,
      status: baby.status || 'pregnant',
      dateOfBirth: baby.date_of_birth ? baby.date_of_birth.split('T')[0] : '',
      lmp: baby.lmp || '',
      edd: baby.edd || '',
      gender: baby.gender || '',
      weightAtBirth: baby.weight_at_birth?.toString() || '',
      heightAtBirth: baby.height_at_birth?.toString() || '',
      bloodType: baby.blood_type || '',
      notes: baby.notes || '',
    });
  };

  return (
    <MainLayout fullWidth>
      <div className="space-y-8">
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

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50">
            <TabsTrigger value="personal" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="partnership" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Kết nối gia đình</TabsTrigger>
            <TabsTrigger value="babies" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Thai nhi / Bé</TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          <TabsContent value="personal" className="outline-none">
            <Card className="border-none shadow-sm">
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
          <TabsContent value="partnership" className="space-y-6 outline-none">
            {loadingPartnership ? (
              <Card className="border-none shadow-sm">
                <CardContent className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </CardContent>
              </Card>
            ) : activePartnership ? (
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="bg-primary/10 h-24 w-full flex items-center justify-center">
                   <Heart className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <CardHeader className="text-center -mt-6">
                  <div className="mx-auto bg-background p-2 rounded-full shadow-md w-fit">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mt-2">Mối quan hệ gia đình</CardTitle>
                  <CardDescription>Bạn đã kết nối thành công với {user.role === 'mother' ? 'bố' : 'mẹ'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-10">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="text-sm text-muted-foreground">Họ và tên</span>
                        <span className="font-bold">{activePartnership.partner?.full_name}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium text-primary">{activePartnership.partner?.email}</span>
                      </div>
                      {activePartnership.partner?.phone && (
                        <div className="flex justify-between items-center border-b border-border/50 pb-2">
                          <span className="text-sm text-muted-foreground">Số điện thoại</span>
                          <span>{activePartnership.partner.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Kết nối gia đình</CardTitle>
                  <CardDescription>
                    {user.role === 'father'
                      ? 'Nhập thông tin của mẹ để cùng nhau theo dõi hành trình của bé'
                      : 'Nhập thông tin của bố để cùng nhau theo dõi hành trình của bé'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePartnership} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="partnerEmail">Email của {user.role === 'father' ? 'mẹ' : 'bố'}</Label>
                      <Input
                        id="partnerEmail"
                        name="partnerEmail"
                        type="email"
                        value={partnerData.partnerEmail}
                        onChange={handlePartnerChange}
                        disabled={loading}
                        placeholder="partner@email.com"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="partnerPhone">Hoặc Số điện thoại</Label>
                      <Input
                        id="partnerPhone"
                        name="partnerPhone"
                        type="tel"
                        value={partnerData.partnerPhone}
                        onChange={handlePartnerChange}
                        disabled={loading}
                        placeholder="+84 9xx xxx xxx"
                        className="h-11"
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 text-xs text-primary/80 flex gap-3">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <p>Khi kết nối, {user.role === 'father' ? 'mẹ' : 'bố'} sẽ thấy được các thông số sức khỏe và hành trình của bé mà bạn cập nhật.</p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-11">
                      {loading ? 'Đang gửi...' : 'Gửi yêu cầu kết nối'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Babies Tab */}
          <TabsContent value="babies" className="space-y-6">


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
                {babies.map((baby) => {
                  // Tính tuần thai client-side (browser JS) để đồng nhất với header.
                  // Tránh lệch kết quả do Python server (FastAPI) dùng timezone server
                  // khác với browser/Next.js khi tính date.today().
                  const { weeks: clientWeeks, daysInWeek: clientDays } =
                    baby.status === 'pregnant' && !baby.date_of_birth
                      ? calculateGestationAge(baby.lmp, baby.edd)
                      : { weeks: null, daysInWeek: null };

                  return (
                  <Card key={baby.id} className={`border-none shadow-sm ${editingBabyId === baby.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="pt-6">
                      {editingBabyId === baby.id ? (
                        <form onSubmit={handleUpdateBaby} className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold">Đang sửa: {baby.name}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingBabyId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Tên bé</Label>
                              <Input
                                id="edit-name"
                                name="name"
                                value={babyData.name}
                                onChange={handleBabyChange}
                                disabled={loading}
                              />
                            </div>
                            
                            {baby.status === 'born' && (
                              <div className="space-y-2">
                                <Label htmlFor="edit-dob">Ngày sinh</Label>
                                <Input
                                  id="edit-dob"
                                  name="dateOfBirth"
                                  type="date"
                                  value={babyData.dateOfBirth}
                                  onChange={handleBabyChange}
                                  disabled={loading}
                                />
                              </div>
                            )}
                          </div>

                          {baby.status === 'pregnant' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded bg-primary/5 border border-primary/10">
                              <div className="space-y-2">
                                <Label htmlFor="edit-lmp">Ngày kinh cuối (LMP)</Label>
                                <Input
                                  id="edit-lmp"
                                  name="lmp"
                                  type="date"
                                  value={babyData.lmp}
                                  onChange={handleBabyChange}
                                  disabled={loading}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-edd">Ngày dự sinh (EDD)</Label>
                                <Input
                                  id="edit-edd"
                                  name="edd"
                                  type="date"
                                  value={babyData.edd}
                                  onChange={handleBabyChange}
                                  disabled={loading}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={loading} className="flex-1">
                              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingBabyId(null)}
                            >
                              Hủy
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{baby.name}</h3>
                              {baby.status === 'pregnant' && (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                  ĐANG MANG THAI
                                </span>
                              )}
                            </div>
                            {baby.date_of_birth ? (
                              <p className="text-sm text-muted-foreground">
                                Ngày sinh: {new Date(baby.date_of_birth).toLocaleDateString('vi-VN')}
                              </p>
                            ) : clientWeeks != null ? (
                              // Tuần thai tính client-side (browser) từ lmp/edd — đồng nhất với header
                              <p className="text-sm text-muted-foreground">
                                Tuần thai:{' '}
                                <span className="font-semibold text-primary">
                                  {formatGestationAge(clientWeeks, clientDays)}
                                </span>
                                {baby.edd ? ` · Dự sinh: ${new Date(baby.edd).toLocaleDateString('vi-VN')}` : ''}
                              </p>
                            ) : baby.lmp || baby.edd ? (
                              <p className="text-sm text-muted-foreground">
                                {baby.edd ? `Dự sinh: ${new Date(baby.edd).toLocaleDateString('vi-VN')}` : ''}
                                {baby.lmp ? ` · LMP: ${new Date(baby.lmp).toLocaleDateString('vi-VN')}` : ''}
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
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(baby)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteBaby(baby.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  );
                })}
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
              <Card className="border-none shadow-sm">
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
                      <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs font-medium text-primary">
                          Nhập ít nhất một trong hai để hệ thống tự tính tuần thai chính xác theo ngày
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="lmp">Ngày kinh cuối (LMP) <span className="text-primary">*</span></Label>
                            <Input
                              id="lmp"
                              name="lmp"
                              type="date"
                              value={babyData.lmp}
                              onChange={handleBabyChange}
                              disabled={loading}
                            />
                            <p className="text-[10px] text-muted-foreground">Ưu tiên — tính tuần thai chính xác nhất</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edd">Ngày dự sinh (EDD)</Label>
                            <Input
                              id="edd"
                              name="edd"
                              type="date"
                              value={babyData.edd}
                              onChange={handleBabyChange}
                              disabled={loading}
                            />
                            <p className="text-[10px] text-muted-foreground">Dùng nếu bác sĩ đã cho ngày dự sinh</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính <span className="text-muted-foreground text-xs">(cập nhật sau)</span></Label>
                        <select
                          id="gender"
                          name="gender"
                          value={babyData.gender}
                          onChange={handleBabyChange}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Chưa biết</option>
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageInner />
    </Suspense>
  );
}
