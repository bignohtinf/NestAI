'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useApp } from '@/lib/context';
import { PregnancyWeekCarouselCylindrical } from './pregnancy-week-carousel-cylindrical';

export function BabyJourneyTracker() {
  const { user } = useApp();

  const isPregnant = user?.babyStatus === 'pregnant';

  if (isPregnant) {
    return <PregnancyJourney user={user} />;
  }

  return <PostpartumJourney user={user} />;
}

// ---------------------------------------------------------
// POSTPARTUM JOURNEY (Saukhi sinh)
// ---------------------------------------------------------
function PostpartumJourney({ user }: { user: any }) {
  const babyAge = useMemo(() => {
    if (!user?.babyDob) {
      return { days: 0, weeks: 0, months: 0, years: 0 };
    }

    const babyDate = new Date(user.babyDob);
    const today = new Date();
    const timeDiff = today.getTime() - babyDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    return { days, weeks, months, years };
  }, [user?.babyDob]);

  const upcomingMilestones: any[] = [];
  const completedMilestones: any[] = [];
  const progressPercentage = (babyAge.days / 180) * 100;

  return (
    <div className="space-y-6">
      {/* Baby Age Display */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-0 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Hành trình của bé yêu
            </h2>
            <p className="text-muted-foreground">
              Ngày sinh: {user?.babyDob || 'Chưa cập nhật'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold text-primary">{Math.max(0, babyAge.days)}</div>
              <div className="text-xs text-muted-foreground font-medium">Ngày tuổi</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold text-secondary">{Math.max(0, babyAge.months)}</div>
              <div className="text-xs text-muted-foreground font-medium">Tháng tuổi</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Tiến độ đến 6 tháng</span>
            <span className="text-sm font-bold text-primary">{Math.round(Math.min(progressPercentage, 100))}%</span>
          </div>
          <div className="h-3 bg-white/50 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Development info & tips */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-sm bg-card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>✨</span> Giai đoạn hiện tại
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="text-4xl">
                {babyAge.months < 2 ? '👶' : babyAge.months < 4 ? '😊' : babyAge.months < 6 ? '🤲' : '🍽️'}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {babyAge.months < 2 ? 'Sơ sinh' : babyAge.months < 4 ? 'Tương tác đầu đời' : babyAge.months < 6 ? 'Khám phá thế giới' : 'Ăn dặm'}
                </p>
                <p className="text-sm text-muted-foreground">Tháng tuổi thứ {babyAge.months + 1}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-amber-50 dark:bg-amber-900/10 border-amber-200/50 shadow-sm">
          <h4 className="font-bold text-amber-900 dark:text-amber-500 mb-4 flex items-center gap-2">
            <span>💡</span> Lời khuyên cho mẹ
          </h4>
          <ul className="space-y-3 text-sm text-amber-800/80 dark:text-amber-200/80">
            {babyAge.months < 2 && (
              <>
                <li className="flex gap-2"><span>•</span><span>Bé cần được bú thường xuyên (8-12 lần/ngày)</span></li>
                <li className="flex gap-2"><span>•</span><span>Theo dõi dấu hiệu vàng da ở trẻ sinh non hoặc đủ tháng</span></li>
                <li className="flex gap-2"><span>•</span><span>Mẹ nên tranh thủ chợp mắt khi bé ngủ để lấy lại sức</span></li>
              </>
            )}
            {babyAge.months >= 2 && babyAge.months < 4 && (
              <>
                <li className="flex gap-2"><span>•</span><span>Bé bắt đầu mỉm cười và tương tác bằng mắt nhiều hơn</span></li>
                <li className="flex gap-2"><span>•</span><span>Tăng cường nói chuyện, hát ru để kích thích thính giác</span></li>
                <li className="flex gap-2"><span>•</span><span>Mẹ có thể bắt đầu các bài tập thể dục nhẹ nhàng (yoga, đi bộ)</span></li>
              </>
            )}
            {babyAge.months >= 4 && babyAge.months < 6 && (
              <>
                <li className="flex gap-2"><span>•</span><span>Bé đã có thể lật, lẫy và giữ đầu khá cứng cáp</span></li>
                <li className="flex gap-2"><span>•</span><span>Cho bé khám phá đồ chơi nhiều màu sắc, âm thanh</span></li>
                <li className="flex gap-2"><span>•</span><span>Chuẩn bị kiến thức cho giai đoạn ăn dặm sắp tới</span></li>
              </>
            )}
            {babyAge.months >= 6 && (
              <>
                <li className="flex gap-2"><span>•</span><span>Bắt đầu hành trình ăn dặm - từ loãng đến đặc dần</span></li>
                <li className="flex gap-2"><span>•</span><span>Giới thiệu từng loại thực phẩm mới một cách chậm rãi</span></li>
                <li className="flex gap-2"><span>•</span><span>Sữa mẹ/sữa công thức vẫn là nguồn dinh dưỡng chính yếu</span></li>
              </>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// PREGNANCY JOURNEY (Đang mang thai)
// ---------------------------------------------------------
function PregnancyJourney({ user }: { user: any }) {
  const weeks = user.gestationWeeks || 1;
  const daysInWeek = user.daysInWeek || 0;
  const progressPercentage = (weeks / 40) * 100;
  const trimester = user.trimester || (weeks <= 13 ? 1 : weeks <= 26 ? 2 : 3);

  // Helper function to get fetal development details based on week
  const getFetalDevelopment = (w: number) => {
    if (w <= 4) return { size: 'Hạt tiêu', weight: '< 1g', desc: 'Phôi thai vừa mới làm tổ. Hệ thần kinh, tủy sống và não bộ bắt đầu hình thành sơ khai.', icon: '🌱' };
    if (w <= 8) return { size: 'Quả mâm xôi', weight: '1g', desc: 'Tim thai bắt đầu đập, các cơ quan nội tạng cơ bản và mầm tay chân đang hình thành.', icon: '🫐' };
    if (w <= 12) return { size: 'Quả chanh', weight: '14g', desc: 'Móng tay, móng chân xuất hiện. Bé có thể nắm tay và cử động ngón chân nhẹ nhàng.', icon: '🍋' };
    if (w <= 16) return { size: 'Quả bơ', weight: '100g', desc: 'Hệ xương bắt đầu cứng lại. Bé biết mút ngón tay và có thể cảm nhận ánh sáng bên ngoài.', icon: '🥑' };
    if (w <= 20) return { size: 'Quả chuối', weight: '300g', desc: 'Mẹ có thể cảm nhận rõ thai máy (bé đạp). Lớp sáp vernix hình thành bảo vệ da bé.', icon: '🍌' };
    if (w <= 24) return { size: 'Bắp ngô', weight: '600g', desc: 'Bé đã có dấu vân tay và vân chân. Phổi bắt đầu phát triển các phế nang.', icon: '🌽' };
    if (w <= 28) return { size: 'Quả cà tím', weight: '1kg', desc: 'Bé có thể mở mắt, chớp mắt và phản ứng rõ rệt với âm thanh bên ngoài.', icon: '🍆' };
    if (w <= 32) return { size: 'Quả dừa', weight: '1.7kg', desc: 'Não bộ phát triển nhanh chóng. Hầu hết xương đã cứng lại (trừ xương sọ).', icon: '🥥' };
    if (w <= 36) return { size: 'Quả dưa lưới', weight: '2.6kg', desc: 'Lớp mỡ dưới da dày lên giúp bé tròn trịa. Phổi gần như đã hoàn thiện để thở.', icon: '🍈' };
    return { size: 'Quả dưa hấu', weight: '3.2kg+', desc: 'Bé đã sẵn sàng chào đời. Đầu bé thường đã quay xuống vùng chậu (ngôi thuận).', icon: '🍉' };
  };

  const devInfo = getFetalDevelopment(weeks);

  return (
    <div className="space-y-6">
      {/* Gestation Age Display */}
      <Card className="p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 border-0 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-9xl opacity-10 select-none">
          {devInfo.icon}
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Hành trình mang thai
            </h2>
            <p className="text-muted-foreground font-medium">
              Ngày dự sinh: {user.dueDate ? new Date(user.dueDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-2xl backdrop-blur-md border border-white/40 shadow-sm text-center min-w-[100px]">
              <div className="text-3xl font-black text-rose-500">{weeks}</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wider">Tuần</div>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-2xl backdrop-blur-md border border-white/40 shadow-sm text-center min-w-[100px]">
              <div className="text-3xl font-black text-orange-500">{daysInWeek}</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wider">Ngày</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-foreground bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-md">Tam cá nguyệt thứ {trimester}</span>
            <span className="text-sm font-bold text-rose-600">{Math.round(Math.min(progressPercentage, 100))}% (40 tuần)</span>
          </div>
          <div className="h-4 bg-white/60 dark:bg-gray-800/60 rounded-full overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Week Carousel Cylindrical */}
      <PregnancyWeekCarouselCylindrical currentWeek={weeks} />

      {/* Fetal Development Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-sm bg-card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <span className="text-xl">👶</span> Sự phát triển của bé
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30">
              <div className="text-5xl shrink-0 drop-shadow-sm">
                {devInfo.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Kích thước tương đương</p>
                <p className="font-bold text-lg text-foreground">{devInfo.size}</p>
                <p className="text-xs font-medium text-pink-600 dark:text-pink-400 mt-1">Cân nặng khoảng: {devInfo.weight}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                {devInfo.desc}
              </p>
            </div>
          </div>
        </Card>

        {/* Tips for mom */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-0 shadow-sm">
          <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <span className="text-xl">👩‍⚕️</span> Lời khuyên tuần {weeks}
          </h4>
          <ul className="space-y-4 text-sm text-emerald-800/90 dark:text-emerald-200/90">
            {trimester === 1 && (
              <>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Uống Acid Folic đều đặn mỗi ngày để phòng ngừa dị tật ống thần kinh.</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Chia nhỏ bữa ăn (5-6 bữa) để giảm triệu chứng buồn nôn, ốm nghén.</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Nghỉ ngơi nhiều hơn, tránh làm việc quá sức hay thức khuya.</span></li>
              </>
            )}
            {trimester === 2 && (
              <>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Bổ sung Sắt và Canxi theo chỉ định (uống cách nhau 2 tiếng).</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Thực hiện nghiệm pháp dung nạp đường huyết (tuần 24-28) để tầm soát tiểu đường thai kỳ.</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Trò chuyện và nghe nhạc cùng bé để kích thích thính giác phát triển.</span></li>
              </>
            )}
            {trimester === 3 && (
              <>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Theo dõi cử động thai (thai máy) mỗi ngày. Đến viện ngay nếu thấy bé ít đạp.</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Tăng cường thực phẩm giàu DHA (cá hồi, quả óc chó) cho trí não bé hoàn thiện.</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500 mt-0.5">●</span><span className="leading-relaxed">Chuẩn bị giỏ đồ đi sinh và tâm lý thật thoải mái đón bé chào đời!</span></li>
              </>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
