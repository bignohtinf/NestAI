'use client';

import React, { useRef, useEffect, useState } from 'react';
import './pregnancy-week-carousel.css';

interface WeekData {
  week: number;
  icon: string;
  color: string;
  description: string;
  size: string;
  weight: string;
}

const weeklyData: WeekData[] = [
  // Trimester 1 (1-13 tuần)
  { week: 1, icon: '🌱', color: 'from-rose-200 to-pink-200', description: 'Phôi thai vừa hình thành', size: 'Hạt tiêu', weight: '<1g' },
  { week: 2, icon: '🌱', color: 'from-rose-200 to-pink-200', description: 'Tế bào phân chia nhanh', size: 'Hạt tiêu', weight: '<1g' },
  { week: 3, icon: '🌱', color: 'from-rose-300 to-pink-300', description: 'Hệ thần kinh hình thành', size: 'Hạt tiêu', weight: '<1g' },
  { week: 4, icon: '🫐', color: 'from-pink-300 to-rose-200', description: 'Tim bắt đầu đập', size: 'Hạt tiêu', weight: '<1g' },
  { week: 5, icon: '🫐', color: 'from-pink-300 to-rose-300', description: 'Các cơ quan nội tạng phát triển', size: 'Hạt tiêu', weight: '<1g' },
  { week: 6, icon: '🫐', color: 'from-pink-400 to-fuchsia-300', description: 'Mầm tay chân xuất hiện', size: 'Quả mâm xôi', weight: '1g' },
  { week: 7, icon: '👁️', color: 'from-pink-400 to-fuchsia-400', description: 'Các tính năng khuôn mặt phát triển', size: 'Quả mâm xôi', weight: '1g' },
  { week: 8, icon: '👁️', color: 'from-fuchsia-300 to-purple-300', description: 'Lỗi khe hàm hoàn thành', size: 'Quả mâm xôi', weight: '1g' },
  { week: 9, icon: '🍋', color: 'from-fuchsia-400 to-purple-400', description: 'Móng tay, móng chân xuất hiện', size: 'Quả chanh', weight: '14g' },
  { week: 10, icon: '🍋', color: 'from-purple-300 to-violet-300', description: 'Bé có thể nắm tay', size: 'Quả chanh', weight: '14g' },
  { week: 11, icon: '👂', color: 'from-purple-400 to-violet-400', description: 'Tai đã phát triển đầy đủ', size: 'Quả chanh', weight: '14g' },
  { week: 12, icon: '👂', color: 'from-violet-300 to-blue-300', description: 'Bé mút ngón tay', size: 'Quả chanh', weight: '14g' },
  { week: 13, icon: '💪', color: 'from-violet-400 to-blue-400', description: 'Giọng nói mẹ có thể nghe rõ', size: 'Quả chanh', weight: '14g' },

  // Trimester 2 (14-26 tuần)
  { week: 14, icon: '💪', color: 'from-blue-300 to-cyan-300', description: 'Lông mí nhỏ xuất hiện', size: 'Quả bơ', weight: '100g' },
  { week: 15, icon: '🧠', color: 'from-blue-400 to-cyan-400', description: 'Xương cứng lại bắt đầu', size: 'Quả bơ', weight: '100g' },
  { week: 16, icon: '🧠', color: 'from-cyan-300 to-teal-300', description: 'Bé cảm nhận ánh sáng', size: 'Quả bơ', weight: '100g' },
  { week: 17, icon: '👃', color: 'from-cyan-400 to-teal-400', description: 'Nốt bướu quanh nhân hiếm hoi', size: 'Quả bơ', weight: '100g' },
  { week: 18, icon: '👃', color: 'from-teal-300 to-green-300', description: 'Bé bắt đầu nghe được âm thanh', size: 'Quả chuối', weight: '300g' },
  { week: 19, icon: '🎵', color: 'from-teal-400 to-green-400', description: 'Bé phản ứng với âm thanh', size: 'Quả chuối', weight: '300g' },
  { week: 20, icon: '🎵', color: 'from-green-300 to-lime-300', description: 'Mẹ cảm nhận rõ thai máy', size: 'Quả chuối', weight: '300g' },
  { week: 21, icon: '💛', color: 'from-green-400 to-lime-400', description: 'Tốc độ tim đạt đỉnh cao', size: 'Quả chuối', weight: '300g' },
  { week: 22, icon: '💛', color: 'from-lime-300 to-yellow-300', description: 'Bé có thể cảm nhận cảm xúc mẹ', size: 'Bắp ngô', weight: '600g' },
  { week: 23, icon: '👶', color: 'from-lime-400 to-yellow-400', description: 'Dấu vân tay hình thành', size: 'Bắp ngô', weight: '600g' },
  { week: 24, icon: '👶', color: 'from-yellow-300 to-orange-300', description: 'Phổi phát triển nhanh chóng', size: 'Bắp ngô', weight: '600g' },
  { week: 25, icon: '✨', color: 'from-yellow-400 to-orange-400', description: 'Bé bắt đầu ngủ và tỉnh dậy theo chu kỳ', size: 'Quả cà tím', weight: '1kg' },
  { week: 26, icon: '✨', color: 'from-orange-300 to-amber-300', description: 'Mắt bé gần như hoàn thiện', size: 'Quả cà tím', weight: '1kg' },

  // Trimester 3 (27-40 tuần)
  { week: 27, icon: '👀', color: 'from-orange-400 to-amber-400', description: 'Bé mở mắt khi tỉnh', size: 'Quả cà tím', weight: '1kg' },
  { week: 28, icon: '👀', color: 'from-amber-300 to-yellow-300', description: 'Bé chớp mắt và phản ứng với ánh sáng', size: 'Quả dừa', weight: '1.7kg' },
  { week: 29, icon: '🧬', color: 'from-amber-400 to-yellow-400', description: 'Não bộ phát triển nhanh chóng', size: 'Quả dừa', weight: '1.7kg' },
  { week: 30, icon: '🧬', color: 'from-yellow-300 to-orange-300', description: 'Bé nghe được tiếng nói rõ ràng', size: 'Quả dừa', weight: '1.7kg' },
  { week: 31, icon: '💥', color: 'from-yellow-400 to-orange-400', description: 'Xương cứng lại hoàn toàn (trừ xương sọ)', size: 'Quả dừa', weight: '1.7kg' },
  { week: 32, icon: '💥', color: 'from-orange-300 to-rose-300', description: 'Lớp mỡ dưới da dày lên', size: 'Quả dưa lưới', weight: '2.6kg' },
  { week: 33, icon: '🌟', color: 'from-orange-400 to-rose-400', description: 'Bé bắt đầu đầu quay xuống', size: 'Quả dưa lưới', weight: '2.6kg' },
  { week: 34, icon: '🌟', color: 'from-rose-300 to-pink-300', description: 'Phổi gần hoàn thiện để thở', size: 'Quả dưa lưới', weight: '2.6kg' },
  { week: 35, icon: '🎉', color: 'from-rose-400 to-pink-400', description: 'Lớp vernix bảo vệ da bé', size: 'Quả dưa lưới', weight: '2.6kg' },
  { week: 36, icon: '🎉', color: 'from-pink-300 to-fuchsia-300', description: 'Bé chủ yếu ở vị trí sinh', size: 'Quả dưa hấu', weight: '3.2kg+' },
  { week: 37, icon: '👼', color: 'from-pink-400 to-fuchsia-400', description: 'Bé sẵn sàng sinh ra bất cứ lúc nào', size: 'Quả dưa hấu', weight: '3.2kg+' },
  { week: 38, icon: '👼', color: 'from-fuchsia-300 to-purple-300', description: 'Bé đã phát triển đầy đủ', size: 'Quả dưa hấu', weight: '3.2kg+' },
  { week: 39, icon: '🍼', color: 'from-fuchsia-400 to-purple-400', description: 'Bé sắp chào đời!', size: 'Quả dưa hấu', weight: '3.2kg+' },
  { week: 40, icon: '👶', color: 'from-purple-300 to-rose-300', description: 'Ngày dự sinh - Bé sẵn sàng chào đời!', size: 'Quả dưa hấu', weight: '3.2kg+' },
];

interface PregnancyWeekCarouselProps {
  currentWeek: number;
  onWeekSelect?: (week: number) => void;
}

export function PregnancyWeekCarousel({ currentWeek = 20, onWeekSelect }: PregnancyWeekCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  // Scroll to center the current week on mount and when currentWeek changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = 120; // width + gap
      const containerWidth = scrollContainerRef.current.clientWidth;
      const targetScroll = currentWeek * cardWidth - containerWidth / 2 + cardWidth / 2;

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
      setSelectedWeek(currentWeek);
    }
  }, [currentWeek]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const newWeek = Math.max(1, selectedWeek - 1);
        handleWeekClick(newWeek);
      } else if (e.key === 'ArrowRight') {
        const newWeek = Math.min(40, selectedWeek + 1);
        handleWeekClick(newWeek);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWeek]);

  const handleWeekClick = (week: number) => {
    setSelectedWeek(week);
    onWeekSelect?.(week);

    if (scrollContainerRef.current) {
      const cardWidth = 120;
      const containerWidth = scrollContainerRef.current.clientWidth;
      const targetScroll = week * cardWidth - containerWidth / 2 + cardWidth / 2;

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with navigation info */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Tuần hiện tại:</span>
          <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-bold text-sm">
            Tuần {selectedWeek}/40
          </span>
        </div>
        <p className="text-xs text-muted-foreground italic">
          💡 Dùng ← → hoặc click để chọn tuần
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Gradient Overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent z-20 pointer-events-none rounded-l-2xl" />

        {/* Right Gradient Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent z-20 pointer-events-none rounded-r-2xl" />

        {/* Scrollable Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-4 px-8 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {weeklyData.map((week) => (
            <div
              key={week.week}
              className={`snap-center shrink-0 transition-all duration-300 ease-out cursor-pointer group`}
              onClick={() => handleWeekClick(week.week)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleWeekClick(week.week);
                }
              }}
            >
              <div
                className={`
                  w-28 h-40 rounded-2xl p-4 flex flex-col items-center justify-center
                  bg-gradient-to-br ${week.color}
                  border-2 shadow-md transition-all duration-300 ease-out
                  ${selectedWeek === week.week
                    ? 'scale-110 shadow-2xl border-white/60 ring-2 ring-offset-2 ring-rose-300'
                    : 'scale-100 hover:scale-105 border-white/30 hover:shadow-xl hover:ring-1 hover:ring-offset-1 hover:ring-rose-200'
                  }
                `}
              >
                {/* Icon */}
                <div className={`text-4xl mb-2 transition-transform duration-300 ${selectedWeek === week.week ? 'scale-125' : 'group-hover:scale-110'}`}>
                  {week.icon}
                </div>

                {/* Week Number */}
                <div className="text-center">
                  <div className="text-2xl font-black text-white drop-shadow-lg">
                    {week.week}
                  </div>
                  <div className="text-xs font-bold text-white/80 drop-shadow-md mt-1">
                    Tuần
                  </div>
                </div>

                {/* Hover Description - Shows on hover */}
                <div className={`
                  absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm
                  rounded-b-xl px-2 py-2 text-white text-center text-xs font-medium
                  opacity-0 group-hover:opacity-100 transition-all duration-300
                  pointer-events-none
                `}>
                  <div className="line-clamp-2">{week.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Details Display */}
      {selectedWeek && (
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200/50 dark:border-rose-900/30 shadow-sm">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                <span className="text-3xl">{weeklyData[selectedWeek - 1].icon}</span>
                Tuần {selectedWeek}
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Kích thước tương đương</p>
                  <p className="font-bold text-foreground">{weeklyData[selectedWeek - 1].size}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Cân nặng khoảng</p>
                  <p className="font-bold text-foreground">{weeklyData[selectedWeek - 1].weight}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-3">Sự phát triển</h4>
              <p className="text-foreground/90 leading-relaxed">
                {weeklyData[selectedWeek - 1].description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator Line */}
      <div className="px-2 space-y-2">
        <div className="text-xs text-muted-foreground font-medium flex justify-between">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <div className="w-full h-1.5 bg-gradient-to-r from-rose-100 via-pink-100 to-orange-100 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(selectedWeek / 40) * 100}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-right">
          Tuần {selectedWeek} / 40 tuần
        </div>
      </div>
    </div>
  );
}
