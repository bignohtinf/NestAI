'use client';

import React, { useState, useMemo } from 'react';
import './pregnancy-week-carousel-3d.css';

interface WeekData {
  week: number;
  icon: string;
  color: string;
  description: string;
  size: string;
  weight: string;
  hexColor: string;
}

const weeklyData: WeekData[] = [
  { week: 1, icon: '🌱', color: 'from-rose-200 to-pink-200', description: 'Phôi thai vừa hình thành', size: 'Hạt tiêu', weight: '<1g', hexColor: '#fbbf24' },
  { week: 2, icon: '🌱', color: 'from-rose-200 to-pink-200', description: 'Tế bào phân chia nhanh', size: 'Hạt tiêu', weight: '<1g', hexColor: '#fcd34d' },
  { week: 3, icon: '🌱', color: 'from-rose-300 to-pink-300', description: 'Hệ thần kinh hình thành', size: 'Hạt tiêu', weight: '<1g', hexColor: '#fbbf24' },
  { week: 4, icon: '🫐', color: 'from-pink-300 to-rose-200', description: 'Tim thai bắt đầu đập', size: 'Hạt tiêu', weight: '<1g', hexColor: '#f87171' },
  { week: 5, icon: '🫐', color: 'from-pink-300 to-rose-300', description: 'Các cơ quan nội tạng phát triển', size: 'Hạt tiêu', weight: '<1g', hexColor: '#fb7185' },
  { week: 6, icon: '🫐', color: 'from-pink-400 to-fuchsia-300', description: 'Mầm tay chân xuất hiện', size: 'Quả mâm xôi', weight: '1g', hexColor: '#f43f5e' },
  { week: 7, icon: '👁️', color: 'from-pink-400 to-fuchsia-400', description: 'Các tính năng khuôn mặt phát triển', size: 'Quả mâm xôi', weight: '1g', hexColor: '#d946ef' },
  { week: 8, icon: '👁️', color: 'from-fuchsia-300 to-purple-300', description: 'Lỗi khe hàm hoàn thành', size: 'Quả mâm xôi', weight: '1g', hexColor: '#c084fc' },
  { week: 9, icon: '🍋', color: 'from-fuchsia-400 to-purple-400', description: 'Móng tay, móng chân xuất hiện', size: 'Quả chanh', weight: '14g', hexColor: '#a855f7' },
  { week: 10, icon: '🍋', color: 'from-purple-300 to-violet-300', description: 'Bé có thể nắm tay', size: 'Quả chanh', weight: '14g', hexColor: '#9333ea' },
  { week: 11, icon: '👂', color: 'from-purple-400 to-violet-400', description: 'Tai đã phát triển đầy đủ', size: 'Quả chanh', weight: '14g', hexColor: '#7c3aed' },
  { week: 12, icon: '👂', color: 'from-violet-300 to-blue-300', description: 'Bé mút ngón tay', size: 'Quả chanh', weight: '14g', hexColor: '#6366f1' },
  { week: 13, icon: '💪', color: 'from-violet-400 to-blue-400', description: 'Giọng nói mẹ có thể nghe rõ', size: 'Quả chanh', weight: '14g', hexColor: '#3b82f6' },
  { week: 14, icon: '💪', color: 'from-blue-300 to-cyan-300', description: 'Lông mí nhỏ xuất hiện', size: 'Quả bơ', weight: '100g', hexColor: '#0ea5e9' },
  { week: 15, icon: '🧠', color: 'from-blue-400 to-cyan-400', description: 'Xương cứng lại bắt đầu', size: 'Quả bơ', weight: '100g', hexColor: '#06b6d4' },
  { week: 16, icon: '🧠', color: 'from-cyan-300 to-teal-300', description: 'Bé cảm nhận ánh sáng', size: 'Quả bơ', weight: '100g', hexColor: '#14b8a6' },
  { week: 17, icon: '👃', color: 'from-cyan-400 to-teal-400', description: 'Nốt bướu quanh nhân hiếm hoi', size: 'Quả bơ', weight: '100g', hexColor: '#20c997' },
  { week: 18, icon: '👃', color: 'from-teal-300 to-green-300', description: 'Bé bắt đầu nghe được âm thanh', size: 'Quả chuối', weight: '300g', hexColor: '#4ade80' },
  { week: 19, icon: '🎵', color: 'from-teal-400 to-green-400', description: 'Bé phản ứng với âm thanh', size: 'Quả chuối', weight: '300g', hexColor: '#22c55e' },
  { week: 20, icon: '🎵', color: 'from-green-300 to-lime-300', description: 'Mẹ cảm nhận rõ thai máy', size: 'Quả chuối', weight: '300g', hexColor: '#84cc16' },
  { week: 21, icon: '💛', color: 'from-green-400 to-lime-400', description: 'Tốc độ tim đạt đỉnh cao', size: 'Quả chuối', weight: '300g', hexColor: '#65a30d' },
  { week: 22, icon: '💛', color: 'from-lime-300 to-yellow-300', description: 'Bé có thể cảm nhận cảm xúc mẹ', size: 'Bắp ngô', weight: '600g', hexColor: '#eab308' },
  { week: 23, icon: '👶', color: 'from-lime-400 to-yellow-400', description: 'Dấu vân tay hình thành', size: 'Bắp ngô', weight: '600g', hexColor: '#facc15' },
  { week: 24, icon: '👶', color: 'from-yellow-300 to-orange-300', description: 'Phổi phát triển nhanh chóng', size: 'Bắp ngô', weight: '600g', hexColor: '#f59e0b' },
  { week: 25, icon: '✨', color: 'from-yellow-400 to-orange-400', description: 'Bé bắt đầu ngủ và tỉnh dậy theo chu kỳ', size: 'Quả cà tím', weight: '1kg', hexColor: '#f97316' },
  { week: 26, icon: '✨', color: 'from-orange-300 to-amber-300', description: 'Mắt bé gần như hoàn thiện', size: 'Quả cà tím', weight: '1kg', hexColor: '#ea580c' },
  { week: 27, icon: '👀', color: 'from-orange-400 to-amber-400', description: 'Bé mở mắt khi tỉnh', size: 'Quả cà tím', weight: '1kg', hexColor: '#dc2626' },
  { week: 28, icon: '👀', color: 'from-amber-300 to-yellow-300', description: 'Bé chớp mắt và phản ứng với ánh sáng', size: 'Quả dừa', weight: '1.7kg', hexColor: '#b91c1c' },
  { week: 29, icon: '🧬', color: 'from-amber-400 to-yellow-400', description: 'Não bộ phát triển nhanh chóng', size: 'Quả dừa', weight: '1.7kg', hexColor: '#991b1b' },
  { week: 30, icon: '🧬', color: 'from-yellow-300 to-orange-300', description: 'Bé nghe được tiếng nói rõ ràng', size: 'Quả dừa', weight: '1.7kg', hexColor: '#7f1d1d' },
  { week: 31, icon: '💥', color: 'from-yellow-400 to-orange-400', description: 'Xương cứng lại hoàn toàn (trừ xương sọ)', size: 'Quả dừa', weight: '1.7kg', hexColor: '#e11d48' },
  { week: 32, icon: '💥', color: 'from-orange-300 to-rose-300', description: 'Lớp mỡ dưới da dày lên', size: 'Quả dưa lưới', weight: '2.6kg', hexColor: '#be123c' },
  { week: 33, icon: '🌟', color: 'from-orange-400 to-rose-400', description: 'Bé bắt đầu đầu quay xuống', size: 'Quả dưa lưới', weight: '2.6kg', hexColor: '#9d174d' },
  { week: 34, icon: '🌟', color: 'from-rose-300 to-pink-300', description: 'Phổi gần hoàn thiện để thở', size: 'Quả dưa lưới', weight: '2.6kg', hexColor: '#831843' },
  { week: 35, icon: '🎉', color: 'from-rose-400 to-pink-400', description: 'Lớp vernix bảo vệ da bé', size: 'Quả dưa lưới', weight: '2.6kg', hexColor: '#500724' },
  { week: 36, icon: '🎉', color: 'from-pink-300 to-fuchsia-300', description: 'Bé chủ yếu ở vị trí sinh', size: 'Quả dưa hấu', weight: '3.2kg+', hexColor: '#7c2d12' },
  { week: 37, icon: '👼', color: 'from-pink-400 to-fuchsia-400', description: 'Bé sẵn sàng sinh ra bất cứ lúc nào', size: 'Quả dưa hấu', weight: '3.2kg+', hexColor: '#92400e' },
  { week: 38, icon: '👼', color: 'from-fuchsia-300 to-purple-300', description: 'Bé đã phát triển đầy đủ', size: 'Quả dưa hấu', weight: '3.2kg+', hexColor: '#b45309' },
  { week: 39, icon: '🍼', color: 'from-fuchsia-400 to-purple-400', description: 'Bé sắp chào đời!', size: 'Quả dưa hấu', weight: '3.2kg+', hexColor: '#d97706' },
  { week: 40, icon: '👶', color: 'from-purple-300 to-rose-300', description: 'Ngày dự sinh - Bé sẵn sàng chào đời!', size: 'Quả dưa hấu', weight: '3.2kg+', hexColor: '#f59e0b' },
];

interface PregnancyWeekCarousel3DProps {
  currentWeek: number;
  onWeekSelect?: (week: number) => void;
}

export function PregnancyWeekCarousel3D({ currentWeek = 20, onWeekSelect }: PregnancyWeekCarousel3DProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [visibleCards, setVisibleCards] = useState(5);

  const handleWeekClick = (week: number) => {
    setSelectedWeek(week);
    onWeekSelect?.(week);
  };

  const handlePrevious = () => {
    const newWeek = Math.max(1, selectedWeek - 1);
    handleWeekClick(newWeek);
  };

  const handleNext = () => {
    const newWeek = Math.min(40, selectedWeek + 1);
    handleWeekClick(newWeek);
  };

  // Tính toán cards cần hiển thị xung quanh tuần hiện tại
  const visibleRange = useMemo(() => {
    const halfVisible = Math.floor(visibleCards / 2);
    const start = Math.max(0, selectedWeek - halfVisible - 1);
    const end = Math.min(40, selectedWeek + halfVisible);

    return weeklyData.slice(start, end + 1);
  }, [selectedWeek, visibleCards]);

  // Tính toán vị trí và góc xoay cho mỗi card (phong cách Cover Flow 3D)
  const calculateCardProps = (weekNumber: number) => {
    const offset = weekNumber - selectedWeek;
    const absOffset = Math.abs(offset);

    // Spread cards horizontally with wide spacing
    const translateX = offset * 250;

    // Push non-selected cards back
    const translateZ = offset === 0 ? 0 : -100 - (absOffset * 80);

    // Rotate Y cards towards the center
    const rotateY = offset === 0 ? 0 : offset > 0 ? -40 : 40;

    // Rotate X for 3D effect - cards tilt down from center (current week is on top)
    const rotateX = offset === 0 ? 0 : offset > 0 ? 25 : -25;

    const scale = offset === 0 ? 1.15 : 0.75 - (absOffset * 0.05);
    const blur = offset === 0 ? 0 : Math.min(absOffset * 1.5, 5);
    const zIndex = 1000 - absOffset * 100; // Better z-index spacing

    return { translateX, translateZ, rotateY, rotateX, scale, blur, zIndex };
  };

  const currentWeekData = weeklyData[selectedWeek - 1];

  return (
    <div className="carousel-3d-container">
      <div className="carousel-3d-wrapper">
        {/* 3D Carousel */}
        <div className="carousel-3d-stage">
          <div className="carousel-3d">
            {visibleRange.map((week) => {
              const props = calculateCardProps(week.week);
              const isSelected = week.week === selectedWeek;

              return (
                <div
                  key={week.week}
                  className={`carousel-3d-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    '--translate-x': `${props.translateX}px`,
                    '--translate-z': `${props.translateZ}px`,
                    '--rotate-y': `${props.rotateY}deg`,
                    '--rotate-x': `${props.rotateX}deg`,
                    '--scale': props.scale,
                    '--blur': `${props.blur}px`,
                    zIndex: props.zIndex,
                    backgroundColor: week.hexColor,
                  } as React.CSSProperties}
                  onClick={() => handleWeekClick(week.week)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleWeekClick(week.week);
                    }
                  }}
                >
                  <div className="card-content">
                    <div className="card-icon">{week.icon}</div>
                    <div className="card-number">{week.week}</div>
                    <div className="card-label">Tuần</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="carousel-controls">
          <div className="control-buttons">
            <button onClick={handlePrevious} className="btn-control" aria-label="Previous week">
              ← Tuần trước
            </button>
            <span className="week-display">
              Tuần <strong>{selectedWeek}</strong>/40
            </span>
            <button onClick={handleNext} className="btn-control" aria-label="Next week">
              Tuần sau →
            </button>
          </div>

          {/* Slider for visible cards */}
          <div className="control-slider">
            <label htmlFor="visible-cards">Hiển thị cards:</label>
            <input
              id="visible-cards"
              type="range"
              min="3"
              max="9"
              step="2"
              value={visibleCards}
              onChange={(e) => setVisibleCards(parseInt(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{visibleCards}</span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {currentWeekData && (
        <div className="carousel-detail-panel">
          <div className="detail-header">
            <div className="detail-icon">{currentWeekData.icon}</div>
            <div className="detail-info">
              <h3>Tuần {currentWeekData.week}</h3>
              <p className="detail-subtitle">
                {Math.ceil(currentWeekData.week / 13) === 1
                  ? 'Tam cá nguyệt 1 - Hình thành'
                  : Math.ceil(currentWeekData.week / 13) === 2
                  ? 'Tam cá nguyệt 2 - Phát triển'
                  : 'Tam cá nguyệt 3 - Chuẩn bị sinh'}
              </p>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Kích thước</div>
              <div className="detail-value">{currentWeekData.size}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Cân nặng</div>
              <div className="detail-value">{currentWeekData.weight}</div>
            </div>

            <div className="detail-description">
              <strong>Sự phát triển:</strong>
              <p>{currentWeekData.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
