'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Baby, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type Step = 'welcome' | 'basic' | 'pregnancy' | 'allergies' | 'preferences' | 'complete';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    pregnancyStage: 'trimester1',
    weekNumber: '8',
    conditions: [] as string[],
    allergies: [] as string[],
    dietaryPreferences: [] as string[],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].includes(value)
        ? (prev as any)[field].filter((v: string) => v !== value)
        : [...(prev as any)[field], value]
    }));
  };

  const steps = {
    welcome: (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-pink-100 rounded-full p-4">
              <Heart className="w-12 h-12 text-pink-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Chào mừng bạn!</h1>
          <p className="text-muted-foreground text-lg">
            Tôi là trợ lý dinh dưỡng AI của bạn, sẵn sàng hỗ trợ bạn trong hành trình thai kỳ và cho con bú
          </p>
          <p className="text-muted-foreground">
            Hãy cùng tôi thiết lập hồ sơ của bạn để nhận những gợi ý dinh dưỡng cá nhân hóa
          </p>
        </div>
        <Button onClick={() => setStep('basic')} className="w-full h-10 text-base">
          Bắt đầu
        </Button>
      </div>
    ),

    basic: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Thông tin cơ bản</h2>
          <p className="text-muted-foreground">Để tính toán đúng nhu cầu dinh dưỡng của bạn</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Lê Thị Hương"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Tuổi</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="28"
              />
            </div>
            <div>
              <Label htmlFor="height">Chiều cao (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="162"
              />
            </div>
            <div>
              <Label htmlFor="weight">Cân nặng (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="62"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
            Quay lại
          </Button>
          <Button onClick={() => setStep('pregnancy')} className="flex-1">
            Tiếp theo
          </Button>
        </div>
      </div>
    ),

    pregnancy: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Baby className="w-6 h-6" />
            Thông tin thai kỳ
          </h2>
          <p className="text-muted-foreground">Giúp tôi hiểu nhu cầu dinh dưỡng của bạn</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Bạn đang ở giai đoạn nào?</Label>
            <RadioGroup value={formData.pregnancyStage} onValueChange={(v) => handleInputChange('pregnancyStage', v)}>
              <div className="flex items-center space-x-2 mt-3">
                <RadioGroupItem value="trimester1" id="tri1" />
                <Label htmlFor="tri1" className="font-normal cursor-pointer">Quý 1 (Tuần 1-13)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="trimester2" id="tri2" />
                <Label htmlFor="tri2" className="font-normal cursor-pointer">Quý 2 (Tuần 14-26)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="trimester3" id="tri3" />
                <Label htmlFor="tri3" className="font-normal cursor-pointer">Quý 3 (Tuần 27-40)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lactating" id="lac" />
                <Label htmlFor="lac" className="font-normal cursor-pointer">Đang cho con bú</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="font-normal cursor-pointer">Không phải</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.pregnancyStage !== 'none' && formData.pregnancyStage !== 'lactating' && (
            <div>
              <Label htmlFor="week">Tuần tuổi: {formData.weekNumber}</Label>
              <input
                id="week"
                type="range"
                min="1"
                max="40"
                value={formData.weekNumber}
                onChange={(e) => handleInputChange('weekNumber', e.target.value)}
                className="w-full mt-2"
              />
            </div>
          )}

          <div>
            <Label>Bạn có tình trạng sức khỏe đặc biệt không?</Label>
            <div className="space-y-2 mt-3">
              {['tiểu-đường-thai-kỳ', 'thiếu-máu', 'tăng-huyết-áp'].map(cond => (
                <div key={cond} className="flex items-center space-x-2">
                  <Checkbox
                    id={cond}
                    checked={formData.conditions.includes(cond)}
                    onCheckedChange={() => toggleArray('conditions', cond)}
                  />
                  <Label htmlFor={cond} className="font-normal cursor-pointer capitalize">
                    {cond.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('basic')} className="flex-1">
            Quay lại
          </Button>
          <Button onClick={() => setStep('allergies')} className="flex-1">
            Tiếp theo
          </Button>
        </div>
      </div>
    ),

    allergies: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Dị ứng & không dung nạp
          </h2>
          <p className="text-muted-foreground">Để bảo vệ sức khỏe của bạn và em bé</p>
        </div>
        <div className="space-y-3">
          {['Hải sản', 'Sữa', 'Trứng', 'Đậu phộng', 'Gluten', 'Các loạt hạt'].map(allergy => (
            <div key={allergy} className="flex items-center space-x-2">
              <Checkbox
                id={allergy}
                checked={formData.allergies.includes(allergy)}
                onCheckedChange={() => toggleArray('allergies', allergy)}
              />
              <Label htmlFor={allergy} className="font-normal cursor-pointer">
                {allergy}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('pregnancy')} className="flex-1">
            Quay lại
          </Button>
          <Button onClick={() => setStep('preferences')} className="flex-1">
            Tiếp theo
          </Button>
        </div>
      </div>
    ),

    preferences: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Sở thích ẩm thực</h2>
          <p className="text-muted-foreground">Để thực đơn hợp khẩu vị của bạn</p>
        </div>
        <div className="space-y-3">
          {['Ăn chay', 'Ăn không chứa gluten', 'Ít tinh bột', 'Ít mỡ', 'Từng bữa nhỏ'].map(pref => (
            <div key={pref} className="flex items-center space-x-2">
              <Checkbox
                id={pref}
                checked={formData.dietaryPreferences.includes(pref)}
                onCheckedChange={() => toggleArray('dietaryPreferences', pref)}
              />
              <Label htmlFor={pref} className="font-normal cursor-pointer">
                {pref}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('allergies')} className="flex-1">
            Quay lại
          </Button>
          <Button onClick={() => setStep('complete')} className="flex-1">
            Hoàn thành
          </Button>
        </div>
      </div>
    ),

    complete: (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-4">
            <Heart className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Hoàn tất!</h2>
          <p className="text-muted-foreground mb-4">
            Hồ sơ của bạn đã được thiết lập xong. Giờ đây tôi có thể giúp bạn lập thực đơn dinh dưỡng tối ưu cho thai kỳ của bạn.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Nhu cầu dinh dưỡng sẽ được cập nhật khi bạn bước sang giai đoạn mới
          </p>
        </div>
        <Link href="/" className="inline-block w-full">
          <Button className="w-full h-10 text-base">
            Bắt đầu sử dụng
          </Button>
        </Link>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-pink-200">
        <CardContent className="pt-8">
          {steps[step]}
        </CardContent>
      </Card>
    </div>
  );
}
