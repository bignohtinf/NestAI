'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MilkScoreGauge } from '@/components/metrics/milk-score-gauge';
import { QuickStats } from '@/components/metrics/quick-stats';
import { QuestCard } from '@/components/gamification/quest-card';
import { Sparkles, Camera, Apple, HeartPulse, Baby, ArrowRight, Star } from 'lucide-react';

const featureCards = [
  {
    href: '/nori',
    icon: Sparkles,
    label: 'Nori AI',
    desc: 'Hỏi bất cứ điều gì',
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-500',
    textColor: 'text-purple-900',
    descColor: 'text-purple-600',
  },
  {
    href: '/nutrition-scan',
    icon: Camera,
    label: 'Quét Dinh Dưỡng',
    desc: 'Tính calo từ ảnh',
    gradient: 'from-orange-400 to-amber-400',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-400',
    textColor: 'text-amber-900',
    descColor: 'text-amber-600',
  },
  {
    href: '/nutrition',
    icon: Apple,
    label: 'Thực Đơn',
    desc: 'Gợi ý dinh dưỡng',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-900',
    descColor: 'text-emerald-600',
  },
  {
    href: '/wellness',
    icon: HeartPulse,
    label: 'Sức Khỏe',
    desc: 'Theo dõi hàng ngày',
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-500',
    textColor: 'text-rose-900',
    descColor: 'text-rose-600',
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng ☀️';
  if (h < 18) return 'Chào buổi chiều 🌤️';
  return 'Chào buổi tối 🌙';
}

export function MomDashboard() {
  const { user, quests } = useApp();
  const [isHydrated, setIsHydrated] = useState(false);
  const [milkScore, setMilkScore] = useState(82);
  const [greeting, setGreeting] = useState('');

  useEffect(() => { 
    setIsHydrated(true);
    // Set greeting only on client to avoid hydration mismatch
    const h = new Date().getHours();
    if (h < 12) setGreeting('Chào buổi sáng ☀️');
    else if (h < 18) setGreeting('Chào buổi chiều 🌤️');
    else setGreeting('Chào buổi tối 🌙');
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMilkScore = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/health/current-score?user_id=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setMilkScore(data.score || 82);
      } catch (error) {
        console.error('Failed to fetch milk score:', error);
        // Keep default value on error
      }
    };
    fetchMilkScore();
  }, [user?.id]);

  const activeQuests = (quests || []).filter((q) => !q.completed).slice(0, 3);

  if (!user || !isHydrated) return null;

  const weekLabel = user.weeksPostpartum > 0
    ? `Tuần ${user.weeksPostpartum} sau sinh`
    : `Đang mang thai`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl shadow-warm text-white" style={{ background: 'linear-gradient(135deg, #c8564a 0%, #d46458 55%, #e07870 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 right-16 h-28 w-28 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute top-4 right-40 h-12 w-12 rounded-full bg-white/12 pointer-events-none" />

        <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7">
          <p className="text-white/80 text-sm font-medium mb-1">{greeting}</p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            Xin chào, {user.name}! 🤱
          </h2>
          <p className="text-white/85 mt-1.5 text-sm sm:text-base">
            Tuần <span className="font-semibold">{user.weeksPostpartum}</span> sau sinh
            <span className="mx-2 opacity-50">•</span>
            <Star className="inline h-3.5 w-3.5 mb-0.5 mr-0.5 text-yellow-300" />
            <span className="font-semibold">{user.points}</span> điểm thưởng
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {featureCards.slice(0, 2).map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-4 py-1.5 text-sm font-medium transition-all"
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
                <ArrowRight className="h-3 w-3 opacity-70" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Quick Access */}
      <div>
        <h3 className="text-base font-semibold text-foreground/80 mb-3">Tính năng nổi bật</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featureCards.map((f) => (
            <Link key={f.href} href={f.href}>
              <div className={`group rounded-xl ${f.bg} border border-border/40 p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full`}>
                <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <p className={`font-semibold text-sm ${f.textColor} leading-tight`}>{f.label}</p>
                <p className={`text-xs mt-0.5 ${f.descColor}`}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Milk Score */}
        <Card className="lg:col-span-1 border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Điểm Sữa
            </CardTitle>
            <CardDescription className="text-xs">Sức khỏe nuôi con bằng sữa mẹ</CardDescription>
          </CardHeader>
          <CardContent>
            <MilkScoreGauge score={milkScore} />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2 border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Tóm tắt Hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MilkScoreGauge score={user?.milkScore || 82} />
          </CardContent>
        </Card>
      </div>

      {/* Baby Journey Link */}
      <Link href="/baby-journey">
        <div className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-rose-100 px-5 py-4 hover:shadow-card transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <Baby className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="font-semibold text-rose-900 text-sm">Hành Trình Của Bé</p>
              <p className="text-xs text-rose-500">Xem các cột mốc phát triển</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            Nhiệm vụ Đang thực hiện
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}