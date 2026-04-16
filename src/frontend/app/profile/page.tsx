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
import { AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [babies, setBabies] = useState<any[]>([]);
  const [loadingBabies, setLoadingBabies] = useState(true);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    age: user?.age || 0,
    weeksPostpartum: user?.weeksPostpartum || 0,
  });

  const [partnerData, setPartnerData] = useState({
    partnerEmail: '',
    partnerPhone: '',
  });

  const [babyData, setBabyData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female',
    weightAtBirth: '',
    heightAtBirth: '',
    bloodType: '',
    notes: '',
  });

  // Fetch babies on mount
  useEffect(() => {
    if (user?.id) {
      fetchBabies();
    }
  }, [user?.id]);

  const fetchBabies = async () => {
    try {
      setLoadingBabies(true);
      const response = await fetch(`/api/babies?user_id=${user?.id}`);
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

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Vui lòng đăng nhập</p>
        </div>
      </MainLayout>
    );
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'weeksPostpartum' ? parseInt(value) || 0 : value,
    }));
  };

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
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công' });
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

      const response = await fetch(`/api/partnerships/request?user_id=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_email: partnerData.partnerEmail,
          partner_phone: partnerData.partnerPhone,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Gửi yêu cầu cập nhật mối quan hệ thành công' });
        setPartnerData({ partnerEmail: '', partnerPhone: '' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Không thể gửi yêu cầu');
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
      if (!babyData.name || !babyData.dateOfBirth) {
        throw new Error('Vui lòng nhập tên và ngày sinh của bé');
      }

      const response = await fetch(`/api/babies?user_id=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: babyData.name,
          date_of_birth: babyData.dateOfBirth,
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
          dateOfBirth: '',
          gender: 'male',
          weightAtBirth: '',
          heightAtBirth: '',
          bloodType: '',
          notes: '',
        });
        setMessage({ type: 'success', text: 'Thêm bé thành công' });
        setTimeout(() => setMessage(null), 3000);
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
            className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success'
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
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={loading}
                      placeholder="Nhập tên của bạn"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Tuổi</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      value={profileData.age}
                      onChange={handleProfileChange}
                      disabled={loading}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weeksPostpartum">Tuần sau sinh</Label>
                    <Input
                      id="weeksPostpartum"
                      name="weeksPostpartum"
                      type="number"
                      min="0"
                      value={profileData.weeksPostpartum}
                      onChange={handleProfileChange}
                      disabled={loading}
                      placeholder="0"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partnership Tab */}
          <TabsContent value="partnership">
            <Card>
              <CardHeader>
                <CardTitle>Cập nhật mối quan hệ</CardTitle>
                <CardDescription>
                  {user.role === 'father'
                    ? 'Cập nhật thông tin liên hệ của mẹ'
                    : 'Cập nhật thông tin liên hệ của bố'}
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

                  <div className="text-sm text-muted-foreground">
                    {user.role === 'father'
                      ? 'Mẹ sẽ nhận được yêu cầu cập nhật mối quan hệ'
                      : 'Bố sẽ nhận được yêu cầu cập nhật mối quan hệ'}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                  </div>

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
                          <p className="text-sm text-muted-foreground">
                            Ngày sinh: {new Date(baby.date_of_birth).toLocaleDateString('vi-VN')}
                          </p>
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
