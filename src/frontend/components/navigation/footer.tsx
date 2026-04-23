'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/60 backdrop-blur">
      <div className="w-full px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/img_0174.png"
                alt="NestAI Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
              <span className="font-bold text-foreground">NestAI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Đồng hành cùng gia đình trong hành trình đón bé yêu. Chăm sóc mẹ và bé với trí tuệ nhân tạo.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Tính năng</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/nori', label: 'Nori AI' },
                { href: '/nutrition-scan', label: 'Quét Dinh Dưỡng' },
                { href: '/nutrition', label: 'Thực Đơn' },
                { href: '/baby-journey', label: 'Hành Trình Bé' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '#', label: 'Trung tâm trợ giúp' },
                { href: '#', label: 'Liên hệ chúng tôi' },
                { href: '#', label: 'Chính sách bảo mật' },
                { href: '#', label: 'Điều khoản sử dụng' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
          <p>© {currentYear} NestAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}