'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import './pregnancy-week-carousel-cylindrical.css';

interface WeekData {
  week: number;
  icon: string;
  description: string;
  size: string;
  weight: string;
  image: string;
}

const getImagePath = (week: number) => {
  const mapping: Record<number, string> = {
    1: '01', 2: '02', 3: '02', 4: '04', 5: '05', 6: '06', 7: '06', 8: '08', 9: '09', 10: '10',
    11: '11', 12: '12', 13: '13', 14: '14', 15: '15', 16: '15', 17: '17', 18: '18', 19: '19', 20: '20',
    21: '21', 22: '22', 23: '23', 24: '24', 25: '25', 26: '26', 27: '27', 28: '28', 29: '29', 30: '30',
    31: '31', 32: '32', 33: '32', 34: '34', 35: '35', 36: '36', 37: '37', 38: '37', 39: '37', 40: '40'
  };
  const num = mapping[week] || week.toString().padStart(2, '0');
  return `/images/baby-journey/baby_week_${num}.jpg`;
};

const weeklyData: WeekData[] = [
  { week: 1, icon: '🌱', description: 'Phôi thai vừa hình thành. Hệ thần kinh, tủy sống và não bộ bắt đầu hình thành sơ khai.', size: 'Hạt tiêu', weight: '< 1g', image: getImagePath(1) },
  { week: 2, icon: '🌱', description: 'Tế bào phân chia nhanh chóng. Phôi thai đang làm tổ trong tử cung.', size: 'Hạt tiêu', weight: '< 1g', image: getImagePath(2) },
  { week: 3, icon: '🌱', description: 'Hệ thần kinh hình thành. Tim thai bắt đầu những nhịp đập đầu tiên.', size: 'Hạt tiêu', weight: '< 1g', image: getImagePath(3) },
  { week: 4, icon: '🫐', description: 'Tim thai bắt đầu đập rõ rệt hơn. Các cơ quan nội tạng cơ bản đang hình thành.', size: 'Hạt tiêu', weight: '< 1g', image: getImagePath(4) },
  { week: 5, icon: '🫐', description: 'Các cơ quan nội tạng phát triển mạnh. Hệ tuần hoàn bắt đầu hoạt động.', size: 'Hạt tiêu', weight: '< 1g', image: getImagePath(5) },
  { week: 6, icon: '🫐', description: 'Mầm tay chân xuất hiện. Các đường nét trên khuôn mặt bắt đầu rõ hơn.', size: 'Quả mâm xôi', weight: '1g', image: getImagePath(6) },
  { week: 7, icon: '👁️', description: 'Các tính năng khuôn mặt phát triển. Bàn tay và bàn chân đang hình thành.', size: 'Quả mâm xôi', weight: '1g', image: getImagePath(7) },
  { week: 8, icon: '👁️', description: 'Lỗi khe hàm hoàn thành. Bé đã bắt đầu có những cử động nhỏ đầu tiên.', size: 'Quả mâm xôi', weight: '1g', image: getImagePath(8) },
  { week: 9, icon: '🍋', description: 'Móng tay, móng chân xuất hiện. Các khớp khuỷu tay và đầu gối đã hình thành.', size: 'Quả chanh', weight: '14g', image: getImagePath(9) },
  { week: 10, icon: '🍋', description: 'Bé có thể nắm tay và cử động ngón chân nhẹ nhàng.', size: 'Quả chanh', weight: '14g', image: getImagePath(10) },
  { week: 11, icon: '👂', description: 'Tai đã phát triển đầy đủ vị trí. Bé bắt đầu có phản xạ nuốt.', size: 'Quả chanh', weight: '14g', image: getImagePath(11) },
  { week: 12, icon: '👂', description: 'Bé biết mút ngón tay. Thận bắt đầu bài tiết nước tiểu vào túi ối.', size: 'Quả chanh', weight: '14g', image: getImagePath(12) },
  { week: 13, icon: '💪', description: 'Dây thanh quản hình thành. Bé có thể có những biểu cảm khuôn mặt.', size: 'Quả chanh', weight: '14g', image: getImagePath(13) },
  { week: 14, icon: '💪', description: 'Lông tơ mịn bắt đầu bao phủ cơ thể để giữ ấm.', size: 'Quả bơ', weight: '100g', image: getImagePath(14) },
  { week: 15, icon: '🧠', description: 'Xương bắt đầu cứng lại. Bé có thể cảm nhận ánh sáng xuyên qua mí mắt.', size: 'Quả bơ', weight: '100g', image: getImagePath(15) },
  { week: 16, icon: '🧠', description: 'Bé cảm nhận ánh sáng và âm thanh từ bên ngoài rõ hơn.', size: 'Quả bơ', weight: '100g', image: getImagePath(16) },
  { week: 17, icon: '👃', description: 'Lớp mỡ dưới da bắt đầu tích tụ. Hệ thống tuần hoàn hoạt động ổn định.', size: 'Quả bơ', weight: '100g', image: getImagePath(17) },
  { week: 18, icon: '👃', description: 'Bé bắt đầu nghe được âm thanh tim đập và tiếng nói của mẹ.', size: 'Quả chuối', weight: '300g', image: getImagePath(18) },
  { week: 19, icon: '🎵', description: 'Bé phản ứng với âm thanh. Một lớp sáp (vernix) bảo vệ da bé hình thành.', size: 'Quả chuối', weight: '300g', image: getImagePath(19) },
  { week: 20, icon: '🎵', description: 'Mẹ cảm nhận rõ thai máy. Bé đang phát triển các giác quan mạnh mẽ.', size: 'Quả chuối', weight: '300g', image: getImagePath(20) },
  { week: 21, icon: '💛', description: 'Tốc độ tim đạt đỉnh cao. Bé bắt đầu có chu kỳ ngủ và thức rõ rệt.', size: 'Quả chuối', weight: '300g', image: getImagePath(21) },
  { week: 22, icon: '💛', description: 'Bé có thể cảm nhận cảm xúc của mẹ. Các cơ bắp phát triển cứng cáp hơn.', size: 'Bắp ngô', weight: '600g', image: getImagePath(22) },
  { week: 23, icon: '👶', description: 'Dấu vân tay hình thành. Lồng ngực bé bắt đầu tập những cử động thở.', size: 'Bắp ngô', weight: '600g', image: getImagePath(23) },
  { week: 24, icon: '👶', description: 'Phổi phát triển nhanh chóng. Các túi khí nhỏ bắt đầu hình thành.', size: 'Bắp ngô', weight: '600g', image: getImagePath(24) },
  { week: 25, icon: '✨', description: 'Bé bắt đầu ngủ và tỉnh dậy theo chu kỳ. Bé đã có thể mở mắt.', size: 'Quả cà tím', weight: '1kg', image: getImagePath(25) },
  { week: 26, icon: '✨', description: 'Mắt bé gần như hoàn thiện. Bé bắt đầu có phản xạ chớp mắt.', size: 'Quả cà tím', weight: '1kg', image: getImagePath(26) },
  { week: 27, icon: '👀', description: 'Bé mở mắt khi tỉnh. Phổi đã có thể hít thở không khí nếu sinh non.', size: 'Quả cà tím', weight: '1kg', image: getImagePath(27) },
  { week: 28, icon: '👀', description: 'Bé chớp mắt và phản ứng với ánh sáng mạnh. Bé mơ khi ngủ.', size: 'Quả dừa', weight: '1.7kg', image: getImagePath(28) },
  { week: 29, icon: '🧬', description: 'Não bộ phát triển nhanh chóng. Bé bắt đầu tích lũy nhiều mỡ hơn.', size: 'Quả dừa', weight: '1.7kg', image: getImagePath(29) },
  { week: 30, icon: '🧬', description: 'Bé nghe được tiếng nói rõ ràng. Tủy xương bắt đầu sản xuất hồng cầu.', size: 'Quả dừa', weight: '1.7kg', image: getImagePath(30) },
  { week: 31, icon: '💥', description: 'Xương cứng lại hoàn toàn trừ xương sọ. Bé cử động nhiều hơn.', size: 'Quả dừa', weight: '1.7kg', image: getImagePath(31) },
  { week: 32, icon: '💥', description: 'Lớp mỡ dưới da dày lên giúp bé tròn trịa. Bé tập thở thường xuyên.', size: 'Quả dưa lưới', weight: '2.6kg', image: getImagePath(32) },
  { week: 33, icon: '🌟', description: 'Bé thường đã quay đầu xuống để chuẩn bị cho ngày chào đời.', size: 'Quả dưa lưới', weight: '2.6kg', image: getImagePath(33) },
  { week: 34, icon: '🌟', description: 'Phổi gần hoàn thiện để thở. Hệ miễn dịch của bé đang phát triển.', size: 'Quả dưa lưới', weight: '2.6kg', image: getImagePath(34) },
  { week: 35, icon: '🎉', description: 'Lớp vernix bảo vệ da bé dày nhất. Thận của bé đã phát triển đầy đủ.', size: 'Quả dưa lưới', weight: '2.6kg', image: getImagePath(35) },
  { week: 36, icon: '🎉', description: 'Bé chủ yếu ở vị trí sinh. Bé tăng cân nhanh chóng mỗi ngày.', size: 'Quả dưa hấu', weight: '3.2kg+', image: getImagePath(36) },
  { week: 37, icon: '👼', description: 'Bé đã "đủ tháng" và sẵn sàng chào đời bất cứ lúc nào.', size: 'Quả dưa hấu', weight: '3.2kg+', image: getImagePath(37) },
  { week: 38, icon: '👼', description: 'Bé đã phát triển đầy đủ tất cả các cơ quan. Bé tiếp tục tích mỡ.', size: 'Quả dưa hấu', weight: '3.2kg+', image: getImagePath(38) },
  { week: 39, icon: '🍼', description: 'Bé sắp chào đời! Nhau thai vẫn cung cấp kháng thể cho bé.', size: 'Quả dưa hấu', weight: '3.2kg+', image: getImagePath(39) },
  { week: 40, icon: '👶', description: 'Ngày dự sinh - Bé đã sẵn sàng để gặp ba mẹ rồi!', size: 'Quả dưa hấu', weight: '3.2kg+', image: getImagePath(40) },
];

// ── Constants ──────────────────────────────────────────────────────────────
const NUM_CELLS = weeklyData.length; // 40
const DEG_PER_CELL = 360 / NUM_CELLS; // 9°
// Responsive radius: smaller on mobile so drum fits the viewport
const RADIUS = typeof window !== 'undefined' && window.innerWidth <= 768 ? 220 : 300;
// 21 z-index layers for the front hemisphere (user's specification):
// layer 21 = front card, layer 1 = edge card (~89°), layer 0 = hidden (≥90°)
const Z_LAYERS = 21;

const weekFromDeg = (deg: number): number => {
  const normalized = ((deg % 360) + 360) % 360;
  return (Math.round(normalized / DEG_PER_CELL) % NUM_CELLS) + 1;
};

interface PregnancyWeekCarouselCylindricalProps {
  currentWeek?: number;
  onWeekSelect?: (week: number) => void;
}

export function PregnancyWeekCarouselCylindrical({
  currentWeek = 20,
  onWeekSelect
}: PregnancyWeekCarouselCylindricalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cylinderRef  = useRef<HTMLDivElement>(null);

  // Pre-collected card DOM refs — populated by ref-callbacks in useMemo
  const cardElsRef = useRef<HTMLElement[]>([]);

  const rotationRef    = useRef((currentWeek - 1) * DEG_PER_CELL);
  const isDragging     = useRef(false);
  const startY         = useRef(0);
  const startRotation  = useRef(0);
  const wheelTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef   = useRef<number | null>(null);

  // Only React state: what the detail panels show (updates only on snap)
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  // ── Core: update all 40 cards' transform + 21-layer z-index + opacity ─────
  // Called directly (never via setState) so it runs at native browser speed.
  const applyRotation = useCallback((deg: number) => {
    rotationRef.current = deg;
    const cards = cardElsRef.current;
    if (!cards.length) return;

    cards.forEach((el, index) => {
      if (!el) return;
      const cardAngle = index * DEG_PER_CELL;

      // Relative angle of this card from the viewer (-180…+180)
      const rel        = ((cardAngle - deg) % 360 + 360) % 360;
      const normalized = rel > 180 ? rel - 360 : rel;
      const absAngle   = Math.abs(normalized);

      // 3D transform: same formula as introduce_3d.txt
      //   rotateX(angle) translateZ(RADIUS)
      el.style.transform = `rotateX(${normalized}deg) translateZ(${RADIUS}px)`;

      if (absAngle >= 90) {
        // Back hemisphere — fully hidden
        el.style.visibility = 'hidden';
        el.style.opacity    = '0';
        el.style.zIndex     = '0';
      } else {
        el.style.visibility = 'visible';

        // 21-layer system: z=21 at 0°, z=1 at 89°
        const layer = Math.max(1, Math.round(Z_LAYERS - (absAngle / 90) * (Z_LAYERS - 1)));
        el.style.zIndex = String(layer);

        // Cosine opacity — feels physically accurate (card facing away → dim)
        const opacity = Math.max(0.12, Math.cos((absAngle / 90) * (Math.PI / 2)));
        el.style.opacity = String(opacity.toFixed(3));
      }
    });
  }, []);

  // ── rAF-based smooth animation (replaces CSS transitions on 40 elements) ──
  const animateToTarget = useCallback((targetDeg: number, duration = 420) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const startDeg  = rotationRef.current;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(now - startTime, duration);
      const t       = elapsed / duration;
      const eased   = 1 - (1 - t) ** 3; // ease-out cubic
      applyRotation(startDeg + (targetDeg - startDeg) * eased);

      if (elapsed < duration) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [applyRotation]);

  // ── Snap to nearest card ──────────────────────────────────────────────────
  const doSnap = useCallback(() => {
    const snapped = Math.round(rotationRef.current / DEG_PER_CELL) * DEG_PER_CELL;
    const week    = weekFromDeg(snapped);
    animateToTarget(snapped);
    setSelectedWeek(week);
    onWeekSelect?.(week);
  }, [animateToTarget, onWeekSelect]);

  // ── Snap to a specific card (click) ───────────────────────────────────────
  const snapToIndex = useCallback((index: number) => {
    animateToTarget(index * DEG_PER_CELL);
    setSelectedWeek(index + 1);
    onWeekSelect?.(index + 1);
  }, [animateToTarget, onWeekSelect]);

  // ── Initial paint (before browser paints — no FOUC) ──────────────────────
  useEffect(() => {
    applyRotation((currentWeek - 1) * DEG_PER_CELL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-apply after cards rebuild (selectedWeek change recreates DOM) ───────
  useEffect(() => {
    applyRotation(rotationRef.current);
  }, [selectedWeek, applyRotation]);

  // ── Sync with prop ────────────────────────────────────────────────────────
  useEffect(() => {
    animateToTarget((currentWeek - 1) * DEG_PER_CELL);
    setSelectedWeek(currentWeek);
  }, [currentWeek, animateToTarget]);

  // ── Mouse wheel ───────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
      const delta = e.deltaY > 0 ? DEG_PER_CELL : -DEG_PER_CELL;
      applyRotation(rotationRef.current + delta);
      wheelTimer.current = setTimeout(doSnap, 180);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
    };
  }, [applyRotation, doSnap]);

  // ── Drag ─────────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    isDragging.current    = true;
    startY.current        = e.clientY;
    startRotation.current = rotationRef.current;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    applyRotation(startRotation.current + (e.clientY - startY.current) * (360 / 700));
  }, [applyRotation]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    doSnap();
  }, [doSnap]);

  // ── Touch ─────────────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    isDragging.current    = true;
    startY.current        = e.touches[0].clientY;
    startRotation.current = rotationRef.current;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    applyRotation(startRotation.current + (e.touches[0].clientY - startY.current) * (360 / 700));
  }, [applyRotation]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    doSnap();
  }, [doSnap]);

  // ── Cards: rebuilt only when selectedWeek changes ─────────────────────────
  // All 40 cards start hidden; applyRotation sets their real transforms.
  const cards = useMemo(() => {
    cardElsRef.current = new Array(NUM_CELLS).fill(null);
    return weeklyData.map((week, index) => {
      const isActive = week.week === selectedWeek;
      return (
        <div
          key={week.week}
          ref={(el) => { if (el) cardElsRef.current[index] = el as HTMLElement; }}
          className={`cylinder-card${isActive ? ' active' : ''}`}
          style={{ visibility: 'hidden' } as React.CSSProperties}
          onClick={() => snapToIndex(index)}
        >
          <div className="card-inner">
            <div className="card-image-container">
              <img src={week.image} alt={`Tuần ${week.week}`} className="baby-image" loading="lazy" />
              <div className="week-badge">Tuần {week.week}</div>
            </div>
          </div>
        </div>
      );
    });
  }, [selectedWeek, snapToIndex]);

  const currentWeekData = weeklyData[selectedWeek - 1];

  const trimester =
    selectedWeek <= 13
      ? 'Tam cá nguyệt 1 - Giai đoạn hình thành'
      : selectedWeek <= 26
      ? 'Tam cá nguyệt 2 - Giai đoạn phát triển'
      : 'Tam cá nguyệt 3 - Giai đoạn hoàn thiện';

  return (
    <div className="cylindrical-carousel-container">
      {/* Title */}
      <div className="carousel-title">
        <h2>💖 Hành Trình Của Bé Yêu</h2>
        <p>Khám phá sự phát triển kỳ diệu qua từng tuần thai kỳ</p>
      </div>

      <div className="main-content-wrapper">
        {/* Detail Panel - Left */}
        {currentWeekData && (
          <div className="detail-panel side-panel left" key={`left-${selectedWeek}`}>
            <div className="detail-header">
              <div className="detail-icon">{currentWeekData.icon}</div>
              <div className="detail-info">
                <h3>Tuần {currentWeekData.week}</h3>
                <p className="detail-subtitle">{trimester}</p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Kích thước chuẩn</div>
                <div className="detail-value">{currentWeekData.size}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Cân nặng trung bình</div>
                <div className="detail-value">{currentWeekData.weight}</div>
              </div>
            </div>

            <div className="milestone-badge">
              <span className="pulse-dot"></span>
              Giai đoạn quan trọng
            </div>
          </div>
        )}

        {/* 3-D Cylinder Stage — Centre */}
        <div
          ref={containerRef}
          className="cylinder-stage vertical"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/*
            The drum — its transform is managed 100% via applyRotation() (DOM ref).
            React never re-renders this div during drag/wheel, so ALL 40 cards
            animate at native browser speed (typically 60–120 fps).
          */}
          <div ref={cylinderRef} className="cylinder">
            {cards}
          </div>

          {/* Gradient masks fade cards at the top/bottom drum edges */}
          <div className="cylinder-mask-top" />
          <div className="cylinder-mask-bottom" />

          {/* Centre slot indicator */}
          <div className="cylinder-center-highlight" />
        </div>

        {/* Summary Panel - Right */}
        {currentWeekData && (
          <div className="summary-panel side-panel right" key={`right-${selectedWeek}`}>
            <div className="summary-header">
              <h4>✨ Tóm tắt tuần này</h4>
            </div>
            <div className="detail-description">
              <strong>Điểm nổi bật:</strong>
              <p>{currentWeekData.description}</p>
            </div>
            <div className="quick-stats">
              <div className="stat-row">
                <span>Trạng thái:</span>
                <span className="stat-tag">Phát triển tốt</span>
              </div>
              <div className="stat-row">
                <span>Cảm xúc:</span>
                <span className="stat-tag">Gắn kết mẹ con</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="week-progress-container">
        <div className="progress-label">
          Tiến trình thai kỳ: {Math.round((selectedWeek / 40) * 100)}%
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(selectedWeek / 40) * 100}%` }}
          />
        </div>
      </div>

      {/* Usage hint */}
      <div className="carousel-instructions">
        ✨ Trượt dọc để xoay vòng &nbsp;&nbsp;•&nbsp;&nbsp; 🖱️ Cuộn chuột để xem nhanh
      </div>
    </div>
  );
}
