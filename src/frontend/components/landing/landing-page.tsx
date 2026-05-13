'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Menu,
  X,
  Heart,
  Brain,
  Baby,
  Users,
  Star,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { AnimatedSphere } from './animated-sphere';
import { Footer } from '@/components/navigation/footer';

// ─── Navigation ──────────────────────────────────────────────────────────────

function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Tính năng', href: '#features' },
    { name: 'Cách hoạt động', href: '#how-it-works' },
    { name: 'Đánh giá', href: '#testimonials' },
  ];

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${isScrolled ? 'top-3 left-4 right-4' : 'top-0 left-0 right-0'
        }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${isScrolled || isMobileOpen
          ? 'bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl shadow-lg max-w-[1200px]'
          : 'bg-transparent max-w-[1400px]'
          }`}
      >
        <div
          className={`flex items-center justify-between px-6 lg:px-8 transition-all duration-500 ${isScrolled ? 'h-14' : 'h-20'
            }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
              <Image
                src="/img_0174.png"
                alt="NestAI"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl text-[#31302e]">NestAI</span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-[#615d59] hover:text-[#31302e] transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c8564a] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#615d59] hover:text-[#31302e] px-4 py-2 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}
            >
              Đăng ký miễn phí
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-[#31302e]"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transition-all duration-500 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`text-4xl font-bold text-[#31302e] transition-all duration-500 ${isMobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                style={{ transitionDelay: isMobileOpen ? `${i * 75}ms` : '0ms' }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div
            className={`flex gap-3 pt-8 border-t border-black/10 transition-all duration-500 ${isMobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            style={{ transitionDelay: isMobileOpen ? '225ms' : '0ms' }}
          >
            <Link
              href="/auth/login"
              onClick={() => setIsMobileOpen(false)}
              className="flex-1 h-14 rounded-full border-2 border-[#c8564a] text-[#c8564a] font-semibold text-base flex items-center justify-center transition-all hover:bg-[#f7ebe9]"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setIsMobileOpen(false)}
              className="flex-1 h-14 rounded-full text-white font-semibold text-base flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const heroWords = ['mẹ bầu', 'gia đình', 'em bé', 'sức khỏe'];

function LandingHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '10,000+', label: 'bà mẹ tin tưởng' },
    { value: '98%', label: 'hài lòng với dịch vụ' },
    { value: '500+', label: 'công thức dinh dưỡng' },
    { value: '24/7', label: 'hỗ trợ AI thông minh' },
  ];

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fdf3f1 0%, #fff8f5 55%, #f0f8f4 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f5c5be, transparent)' }}
      />
      <div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #b8e0d4, transparent)' }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4c5f5, transparent)' }}
      />

      {/* Animated sphere — right side background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[520px] h-[520px] lg:w-[700px] lg:h-[700px] opacity-50 pointer-events-none">
        <AnimatedSphere />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow badge */}
        <div
          className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#c8564a] bg-[#f7ebe9] px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Nền tảng chăm sóc sau sinh hàng đầu Việt Nam
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-10">
          <h1
            className={`text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[1.05] tracking-tight text-[#31302e] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <span className="block">Đồng hành cùng</span>
            <span className="block">
              <span className="relative inline-block" style={{ color: '#c8564a' }}>
                <span key={wordIndex} className="inline-flex">
                  {heroWords[wordIndex].split('').map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block landing-char-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {char === ' ' ? ' ' : char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-2 rounded-full opacity-20 bg-[#c8564a]" />
              </span>
            </span>
            <span className="block">của bạn.</span>
          </h1>
        </div>

        {/* Description + CTAs grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p
            className={`text-xl lg:text-2xl text-[#615d59] leading-relaxed max-w-xl transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            NestAI giúp các bà mẹ và gia đình theo dõi dinh dưỡng, sức khỏe và hành trình phát triển của em bé với sức mạnh của AI.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 h-14 px-8 rounded-full font-semibold text-white text-base transition-all hover:opacity-90 active:scale-[0.98] group"
              style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center h-14 px-8 rounded-full font-semibold text-[#31302e] text-base border-2 border-[#31302e]/20 hover:border-[#c8564a] hover:text-[#c8564a] transition-all"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div
          className={`mt-20 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {stats.map(stat => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-bold text-[#31302e]">{stat.value}</span>
                <span className="text-sm text-[#615d59]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    number: '01',
    Icon: Brain,
    title: 'AI Dinh dưỡng thông minh',
    description:
      'Phân tích bữa ăn bằng camera, đề xuất thực đơn phù hợp với tình trạng sau sinh. AI học từ thói quen ăn uống của bạn để cá nhân hoá lời khuyên.',
    color: '#c8564a',
    bg: '#f7ebe9',
  },
  {
    number: '02',
    Icon: Heart,
    title: 'Theo dõi sức khỏe toàn diện',
    description:
      'Giám sát các chỉ số sức khỏe mẹ, nhận cảnh báo sớm và lời khuyên từ chuyên gia dinh dưỡng được hỗ trợ bởi AI.',
    color: '#4f9678',
    bg: '#e8f5ef',
  },
  {
    number: '03',
    Icon: Baby,
    title: 'Hành trình em bé',
    description:
      'Theo dõi sự phát triển của con từng ngày, ghi lại những cột mốc quan trọng và nhận tư vấn nuôi dưỡng phù hợp theo từng giai đoạn.',
    color: '#0075de',
    bg: '#f2f9ff',
  },
  {
    number: '04',
    Icon: Users,
    title: 'Cộng đồng gia đình',
    description:
      'Kết nối bố, mẹ và gia đình trong một không gian chung. Chia sẻ, hỗ trợ nhau trên hành trình làm cha mẹ lần đầu.',
    color: '#7c4daa',
    bg: '#f5f0ff',
  },
];

function FeaturesSection() {
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = features.map((_, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisibleSet(prev => new Set([...prev, index]));
        },
        { threshold: 0.15 }
      );
      if (itemRefs.current[index]) observer.observe(itemRefs.current[index]!);
      return observer;
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return (
    <section id="features" className="relative py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#c8564a] bg-[#f7ebe9] px-4 py-1.5 rounded-full mb-6">
            Tính năng
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#31302e] tracking-tight">
            Mọi thứ bạn cần.
            <br />
            <span className="text-[#a39e98]">Ngay trong tầm tay.</span>
          </h2>
        </div>

        <div>
          {features.map((feature, index) => {
            const { Icon } = feature;
            const isVisible = visibleSet.has(index);
            return (
              <div
                key={feature.number}
                ref={el => { itemRefs.current[index] = el; }}
                className={`group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-16 border-b border-black/10">
                  <div className="shrink-0 pt-1">
                    <span className="font-mono text-sm text-[#a39e98]">{feature.number}</span>
                  </div>
                  <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-[#31302e] mb-4 group-hover:translate-x-2 transition-transform duration-500">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-[#615d59] leading-relaxed">{feature.description}</p>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div
                        className="w-40 h-40 rounded-3xl flex items-center justify-center"
                        style={{ background: feature.bg }}
                      >
                        <Icon className="w-16 h-16" style={{ color: feature.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  {
    step: '01',
    emoji: '📝',
    title: 'Tạo tài khoản',
    description: 'Đăng ký miễn phí trong vài giây. Điền thông tin cơ bản về bạn và em bé.',
  },
  {
    step: '02',
    emoji: '👤',
    title: 'Thiết lập hồ sơ',
    description: 'Chọn vai trò (mẹ hoặc bố), cung cấp thông tin sức khỏe để AI cá nhân hoá trải nghiệm.',
  },
  {
    step: '03',
    emoji: '🚀',
    title: 'Bắt đầu hành trình',
    description: 'Theo dõi dinh dưỡng, sức khỏe và sự phát triển của em bé mỗi ngày cùng AI.',
  },
];

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 lg:py-32" style={{ background: '#f6f5f4' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#4f9678] bg-[#e8f5ef] px-4 py-1.5 rounded-full mb-6">
            Cách hoạt động
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#31302e] tracking-tight">
            Bắt đầu chỉ trong
            <br />3 bước đơn giản
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((s, index) => (
            <div
              key={s.step}
              className={`bg-white rounded-2xl p-8 border border-black/10 transition-all duration-700 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              style={{
                transitionDelay: `${index * 150}ms`,
                boxShadow: 'rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2px 8px',
              }}
            >
              <div className="text-4xl mb-4">{s.emoji}</div>
              <div className="font-mono text-sm text-[#a39e98] mb-2">{s.step}</div>
              <h3 className="text-xl font-bold text-[#31302e] mb-3">{s.title}</h3>
              <p className="text-[#615d59] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        {/* CTA inside section */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-full font-semibold text-white text-base transition-all hover:opacity-90 active:scale-[0.98] group"
            style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}
          >
            Thử ngay miễn phí
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: 'Nguyễn Thị Hoa',
    role: 'Mẹ của bé Minh, 6 tháng',
    content:
      'NestAI đã giúp tôi theo dõi dinh dưỡng sau sinh một cách dễ dàng. Tôi không còn lo lắng về việc ăn gì nữa!',
    stars: 5,
    initial: 'H',
    color: '#c8564a',
  },
  {
    name: 'Trần Văn Nam',
    role: 'Bố của bé An, 3 tháng',
    content:
      'Ứng dụng giúp tôi hiểu hơn về sức khỏe của vợ và con. Tôi có thể đồng hành tốt hơn trong giai đoạn quan trọng này.',
    stars: 5,
    initial: 'N',
    color: '#4f9678',
  },
  {
    name: 'Lê Thị Mai',
    role: 'Mẹ của bé Khôi, 8 tháng',
    content:
      'Tính năng theo dõi hành trình em bé rất hay! Tôi lưu được rất nhiều kỷ niệm đẹp và nhận được lời khuyên hữu ích.',
    stars: 5,
    initial: 'M',
    color: '#0075de',
  },
];

function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="testimonials" ref={sectionRef} className="py-24 lg:py-32 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#c8564a] bg-[#f7ebe9] px-4 py-1.5 rounded-full mb-6">
            Đánh giá
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#31302e] tracking-tight">
            Được tin yêu bởi
            <br />hàng nghìn gia đình
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className={`bg-[#f6f5f4] rounded-2xl p-8 transition-all duration-700 hover:shadow-md hover:-translate-y-0.5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex gap-1 mb-5">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-[#dd5b00]" />
                ))}
              </div>
              <p className="text-[#31302e] leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)` }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#31302e]">{t.name}</p>
                  <p className="text-xs text-[#a39e98]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

const benefits = [
  'Hoàn toàn miễn phí để bắt đầu',
  'Không cần thẻ tín dụng',
  'Cài đặt trong 2 phút',
  'Huỷ bất cứ lúc nào',
];

function CTASection() {
  return (
    <section
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #c8564a 0%, #d46458 45%, #4f9678 100%)' }}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          Bắt đầu hành trình
          <br />của bạn hôm nay
        </h2>
        <p className="text-xl text-white/80 mb-10 leading-relaxed">
          Tham gia cùng hàng nghìn gia đình đang sử dụng NestAI để chăm sóc sức khỏe và dinh dưỡng sau sinh.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white text-[#c8564a] font-semibold text-base transition-all hover:bg-white/90 active:scale-[0.98] group"
          >
            Tạo tài khoản miễn phí
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-white/50 text-white font-semibold text-base transition-all hover:border-white hover:bg-white/10"
          >
            Đăng nhập
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {benefits.map(b => (
            <div key={b} className="flex items-center gap-2 text-white/80 text-sm">
              <CheckCircle className="w-4 h-4 text-white shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

// ─── Main Export ──────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="relative">
      <LandingNav />
      <LandingHero />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
