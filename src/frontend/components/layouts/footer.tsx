import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { MicroLabel } from '@/components/ui/typography';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections?: FooterSection[];
  copyright?: string;
  className?: string;
}

export function Footer({
  sections = [],
  copyright = `© ${new Date().getFullYear()} NestAI. All rights reserved.`,
  className,
}: FooterProps) {
  return (
    <footer
      className={cn(
        'w-full bg-white border-t border-black/10 py-12 md:py-16 px-4 md:px-8',
        className
      )}
    >
      <div className="max-w-6xl mx-auto">
        {/* Logo and Branding */}
        <div className="mb-12 flex items-center gap-3">
          <Image
            src="/img_0174.png"
            alt="NestAI Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <h3 className="text-lg font-bold text-foreground">NestAI</h3>
        </div>

        {/* Footer Sections */}
        {sections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-[rgba(0,0,0,0.95)] mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#615d59] hover:text-[#0075de] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-black/10 pt-8">
          <MicroLabel className="text-center text-[#a39e98]">
            {copyright}
          </MicroLabel>
        </div>
      </div>
    </footer>
  );
}
