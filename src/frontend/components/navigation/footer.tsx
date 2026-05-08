'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';

export function Footer({ className }: { className?: string }) {
  const { user } = useApp();
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on nori page and for admin role
  if (pathname.includes('/nori') || user?.role === 'admin' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className={cn('border-t border-border/50 bg-card/60 backdrop-blur', className)}>
      <div className="w-full px-4 pt-8 pb-4 sm:px-6">
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
              Trợ lý dinh dưỡng AI cho mẹ bầu và mẹ cho con bú tại Việt Nam — thực đơn theo tuần thai, món Việt quen thuộc.
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
                { href: '/support', label: 'Trung tâm trợ giúp' },
                { href: '/contact', label: 'Liên hệ chúng tôi' },
                { href: '/privacy', label: 'Chính sách bảo mật' },
                { href: '/terms', label: 'Điều khoản sử dụng' },
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

        <div className="mt-6 border-t border-border/40 pt-6 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
          <p>© {currentYear} NestAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}