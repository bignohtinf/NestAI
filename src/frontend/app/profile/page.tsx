'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layouts/main-layout';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Plus, Trash2, Heart, Mail, Phone } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading, fetchUserData } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [babies, setBabies] = useState<any[]>([]);
  const [loadingBabies, setLoadingBabies] = useState(true);

  const [phone, setPhone] = useState('');
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/me?user_id=${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (data.phone) setPhone(data.phone); })
      .catch(() => {});
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

  // Fetch babies on mount
  useEffect(() => {
    if (user?.id) {
      fetchBabies();
    }
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/me?user_id=${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật số điện thoại thành công' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Không thể cập nhật số điện thoại');
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trang cá nhân</h1>
          <p className="text-muted-foreground mt-2">Quản lý thông tin cá nhân, mối quan hệ và bé</p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="partnership">Mối quan hệ</TabsTrigger>
            <TabsTrigger value="babies">Bé</TabsTrigger>
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

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Đang cập nhật...' : 'Cập nhật số điện thoại'}
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
          <TabsContent value="babies" className="space-y-4">
            {/* Add Baby Form */}
            <Card>
              <CardHeader>
                <CardTitle>Thêm bé mới</CardTitle>
                <CardDescription>Nhập thông tin của bé</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBaby} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
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

                  <Button type="submit" disabled={loading} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? 'Đang thêm...' : 'Thêm bé'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Babies List */}
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
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
