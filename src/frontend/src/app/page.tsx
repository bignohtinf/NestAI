'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockUser, mockDailyLog, mockNutritionGoal } from '@/lib/mock-data';
import { Apple, Camera, ClipboardList, TrendingUp, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Camera,
    title: 'Phân tích ảnh bữa ăn',
    description: 'Chụp ảnh để kiểm tra calo và vi chất - đảm bảo bạn và em bé được nuôi dưỡng đúng cách',
    href: '/photo-analysis',
  },
  {
    icon: ClipboardList,
    title: 'Lập thực đơn cá nhân',
    description: 'Nhận thực đơn tuần được tối ưu hóa theo giai đoạn thai kỳ và nhu cầu của bạn',
    href: '/menu-planner',
  },
  {
    icon: Heart,
    title: 'Theo dõi vi chất thiết yếu',
    description: 'Kiểm soát sắt, canxi, axit folic, DHA và các chất dinh dưỡng quan trọng khác',
    href: '/nutrition-calc',
  },
  {
    icon: TrendingUp,
    title: 'Theo dõi cân nặng & sức khỏe',
    description: 'Xem biểu đồ cân nặng, tình trạng sức khỏe suốt thai kỳ',
    href: '/dashboard',
  },
  {
    icon: Zap,
    title: 'Công thức ăn dễ thực hiện',
    description: 'Các công thức nấu ăn nhanh, an toàn và lành mạnh cho mẹ bầu',
    href: '/menu-planner',
  },
  {
    icon: Apple,
    title: 'Quản lý tình trạng sức khỏe',
    description: 'Cập nhật dị ứng, không dung nạp, và điều chỉnh chế độ ăn theo tình trạng đặc biệt',
    href: '/profile',
  },
];

const todayIntake = mockDailyLog.totalNutrition;
const goal = mockNutritionGoal;

export default function Home() {
  const caloriesPercent = (todayIntake.calories / goal.dailyCalories) * 100;
  const proteinPercent = (todayIntake.protein / (goal.dailyCalories * goal.proteinPercentage / 100 / 4)) * 100;
  const carbsPercent = (todayIntake.carbs / (goal.dailyCalories * goal.carbsPercentage / 100 / 4)) * 100;
  const fatPercent = (todayIntake.fat / (goal.dailyCalories * goal.fatPercentage / 100 / 9)) * 100;

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section className="space-y-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Xin chào, {mockUser.name.split(' ').pop()}! 💕
            </h1>
            {mockUser.pregnancy?.stage !== 'none' && (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-pink-700">
                  Tuần {mockUser.pregnancy?.weekNumber} - {
                    mockUser.pregnancy?.stage === 'trimester1' ? 'Quý 1' :
                    mockUser.pregnancy?.stage === 'trimester2' ? 'Quý 2' :
                    mockUser.pregnancy?.stage === 'trimester3' ? 'Quý 3' :
                    'Cho con bú'
                  }
                </p>
                <p className="text-muted-foreground text-base">
                  Hãy kiên trì chăm sóc dinh dưỡng tốt - đó là cách tuyệt nhất để yêu thương em bé của bạn
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Today's Nutrition Overview */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dinh dưỡng hôm nay</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Theo dõi để đảm bảo bạn và em bé nhận đủ chất dinh dưỡng từng ngày
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calories Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Calo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-primary">
                  {todayIntake.calories.toFixed(0)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mục tiêu</span>
                    <span className="font-medium">{goal.dailyCalories}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(caloriesPercent)}% hoàn thành
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Protein Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Protein</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-accent">
                  {todayIntake.protein.toFixed(0)}g
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mục tiêu</span>
                    <span className="font-medium">
                      {Math.round(goal.dailyCalories * goal.proteinPercentage / 100 / 4)}g
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full transition-all"
                      style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(proteinPercent)}% hoàn thành
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Carbs Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Carbs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-sky-500">
                  {todayIntake.carbs.toFixed(0)}g
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mục tiêu</span>
                    <span className="font-medium">
                      {Math.round(goal.dailyCalories * goal.carbsPercentage / 100 / 4)}g
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(carbsPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(carbsPercent)}% hoàn thành
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fat Card */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Chất béo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-yellow-500">
                  {todayIntake.fat.toFixed(0)}g
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mục tiêu</span>
                    <span className="font-medium">
                      {Math.round(goal.dailyCalories * goal.fatPercentage / 100 / 9)}g
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(fatPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(fatPercent)}% hoàn thành
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Các tính năng chính</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <Card className="h-full border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Bắt đầu ngay hôm nay</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sử dụng ứng dụng của chúng tôi để theo dõi bữa ăn, quản lý dinh dưỡng và đạt được mục tiêu sức khỏe của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/photo-analysis">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Camera className="w-4 h-4 mr-2" />
                Phân tích ảnh
              </Button>
            </Link>
            <Link href="/menu-planner">
              <Button variant="outline" className="border-border">
                <ClipboardList className="w-4 h-4 mr-2" />
                Lập menu
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
