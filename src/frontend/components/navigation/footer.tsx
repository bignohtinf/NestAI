'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FileText } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import { DocViewerDialog } from '@/components/navigation/doc-viewer-dialog';

const HEALTH_DOCS = [
  {
    id: '776',
    label: 'Dinh dưỡng cho mẹ bầu & mẹ cho con bú',
    shortLabel: 'QĐ 776/QĐ-BYT',
    file: '/docs/776_QD-BYT.md',
  },
  {
    id: '1470',
    label: 'Sàng lọc & quản lý đái tháo đường thai kỳ',
    shortLabel: 'QĐ 1470/QĐ-BYT',
    file: '/docs/1470_QD-BYT.md',
  },
  {
    id: '4128',
    label: 'Dịch vụ chăm sóc sức khỏe sinh sản',
    shortLabel: 'QĐ 4128/QĐ-BYT',
    file: '/docs/4128_QD-BYT.md',
  },
];

export function Footer({ className }: { className?: string }) {
  const { user } = useApp();
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [activeDoc, setActiveDoc] = useState<typeof HEALTH_DOCS[number] | null>(null);

  // Hide footer on nori page and for admin role
  if (pathname.includes('/nori') || user?.role === 'admin' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className={cn('border-t border-border/50 bg-card/60 backdrop-blur', className)}>
      <div className="w-full px-4 pt-8 pb-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

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
          {/* Health Documents */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Tài liệu Bộ Y Tế</h4>
            <ul className="space-y-2 text-sm">
              {HEALTH_DOCS.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => setActiveDoc(doc)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left flex items-start gap-1.5 group"
                  >
                    <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    <span className="leading-snug">{doc.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-border/40 pt-6 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
          <p>© {currentYear} NestAI. All rights reserved.</p>
        </div>
      </div>

      {/* Document Viewer Dialog */}
      {activeDoc && (
        <DocViewerDialog
          open={!!activeDoc}
          onOpenChange={(open) => { if (!open) setActiveDoc(null); }}
          title={`${activeDoc.shortLabel} — ${activeDoc.label}`}
          fileUrl={activeDoc.file}
        />
      )}
    </footer>
  );
}