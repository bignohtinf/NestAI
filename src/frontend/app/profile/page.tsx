'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { mockUser, mockNutritionGoal } from '@/lib/mock-data';
import { User, Mail, MapPin, Cake, Ruler, Weight, Edit2, Save } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    age: mockUser.age,
    height: mockUser.height,
    weight: mockUser.weight,
    gender: mockUser.gender,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to the database
  };

  const bmi = formData.height && formData.weight 
    ? (formData.weight / ((formData.height / 100) ** 2)).toFixed(1) 
    : 'N/A';

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Hồ sơ của tôi</h1>
            <p className="text-muted-foreground">Quản lý thông tin cá nhân và mục tiêu sức khỏe</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </>
            )}
          </Button>
        </div>

        {/* Profile Overview */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback>{mockUser.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{mockUser.name}</h3>
                <p className="text-muted-foreground">{mockUser.email}</p>
              </div>
              {isEditing && (
                <Button variant="outline" className="border-border">
                  Đổi ảnh
                </Button>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="w-4 h-4" />
                  Tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{formData.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{formData.email}</p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Cake className="w-4 h-4" />
                  Tuổi
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{formData.age} tuổi</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Giới tính</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                ) : (
                  <p className="text-foreground">
                    {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : 'Khác'}
                  </p>
                )}
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Ruler className="w-4 h-4" />
                  Chiều cao (cm)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{formData.height} cm</p>
                )}
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Weight className="w-4 h-4" />
                  Cân nặng (kg)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-foreground">{formData.weight} kg</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Metrics */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Chỉ số sức khỏe</CardTitle>
            <CardDescription>Các chỉ số sức khỏe được tính toán từ thông tin của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-sm text-muted-foreground mb-2">Chỉ số BMI</div>
                <div className="text-3xl font-bold text-primary">{bmi}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {bmi !== 'N/A' && (
                    <>
                      {Number(bmi) < 18.5
                        ? 'Thiếu cân'
                        : Number(bmi) < 25
                          ? 'Bình thường'
                          : Number(bmi) < 30
                            ? 'Thừa cân'
                            : 'Béo phì'}
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-sm text-muted-foreground mb-2">Cân nặng lý tưởng</div>
                <div className="text-3xl font-bold text-accent">
                  {formData.height 
                    ? Math.round(18.5 * ((formData.height / 100) ** 2) * 10) / 10
                    : 'N/A'}
                  {formData.height && <span className="text-lg"> - {Math.round(24.9 * ((formData.height / 100) ** 2) * 10) / 10}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-2">kg</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-sm text-muted-foreground mb-2">Lượng nước cần uống</div>
                <div className="text-3xl font-bold text-blue-500">
                  {mockNutritionGoal.waterIntakeLiters}
                </div>
                <div className="text-xs text-muted-foreground mt-2">lít/ngày</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sở thích ăn uống</CardTitle>
            <CardDescription>Các loại thực phẩm và chế độ ăn uống bạn thích</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Loại ăn uống yêu thích</h4>
                <div className="flex flex-wrap gap-2">
                  {mockUser.dietaryPreferences?.map((pref) => (
                    <span key={pref} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Dị ứng thực phẩm</h4>
                <div className="flex flex-wrap gap-2">
                  {mockUser.allergies?.map((allergy) => (
                    <span key={allergy} className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-sm font-medium">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Mục tiêu dinh dưỡng hàng ngày</CardTitle>
            <CardDescription>Các mục tiêu dinh dưỡng cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Calo</span>
                  <span className="text-2xl font-bold text-primary">{mockNutritionGoal.dailyCalories}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-full rounded-full" style={{ width: '70%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">kcal/ngày</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Protein</span>
                  <span className="text-2xl font-bold text-accent">
                    {Math.round((mockNutritionGoal.dailyCalories * mockNutritionGoal.proteinPercentage) / 100 / 4)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-full rounded-full" style={{ width: '80%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">g/ngày ({mockNutritionGoal.proteinPercentage}%)</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Carbs</span>
                  <span className="text-2xl font-bold text-sky-500">
                    {Math.round((mockNutritionGoal.dailyCalories * mockNutritionGoal.carbsPercentage) / 100 / 4)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">g/ngày ({mockNutritionGoal.carbsPercentage}%)</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Chất béo</span>
                  <span className="text-2xl font-bold text-yellow-500">
                    {Math.round((mockNutritionGoal.dailyCalories * mockNutritionGoal.fatPercentage) / 100 / 9)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-500 h-full rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">g/ngày ({mockNutritionGoal.fatPercentage}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
