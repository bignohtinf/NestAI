import React from 'react';
import { cn } from '@/lib/utils';
import { DisplayHero, BodyLarge, SecondaryText } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/section';

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  image?: React.ReactNode;
  className?: string;
}

export function Hero({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  image,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        'w-full bg-white py-20 md:py-32 px-4 md:px-8',
        className
      )}
    >
      <Container maxWidth="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="flex flex-col gap-6">
            {subtitle && (
              <div className="inline-flex w-fit">
                <span className="text-[0.75rem] font-semibold tracking-[0.125px] bg-[#f2f9ff] text-[#097fe8] px-3 py-1 rounded-full">
                  {subtitle}
                </span>
              </div>
            )}

            <DisplayHero className="text-[2.5rem] md:text-[4rem]">
              {title}
            </DisplayHero>

            {description && (
              <BodyLarge className="text-[#615d59] max-w-lg">
                {description}
              </BodyLarge>
            )}

            {/* CTAs */}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {primaryCta && (
                  <Button variant="primary" size="lg" asChild>
                    <a href={primaryCta.href}>{primaryCta.label}</a>
                  </Button>
                )}
                {secondaryCta && (
                  <Button variant="secondary" size="lg" asChild>
                    <a href={secondaryCta.href}>{secondaryCta.label}</a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Image/Illustration */}
          {image && (
            <div className="flex items-center justify-center">
              {image}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
