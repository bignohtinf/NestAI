import React from 'react';
import { cn } from '@/lib/utils';

/* Display Headings */
export const DisplayHero = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-[4rem] font-bold leading-tight tracking-[-2.125px] text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
DisplayHero.displayName = 'DisplayHero';

export const DisplaySecondary = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-[3.375rem] font-bold leading-tight tracking-[-1.875px] text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
DisplaySecondary.displayName = 'DisplaySecondary';

/* Section Heading */
export const SectionHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-[3rem] font-bold leading-tight tracking-[-1.5px] text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
SectionHeading.displayName = 'SectionHeading';

/* Sub-heading Large */
export const SubheadingLarge = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-[2.5rem] font-bold leading-normal text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
SubheadingLarge.displayName = 'SubheadingLarge';

/* Sub-heading */
export const Subheading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-[1.625rem] font-bold leading-tight tracking-[-0.625px] text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
Subheading.displayName = 'Subheading';

/* Card Title */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(
      'text-[1.375rem] font-bold leading-snug tracking-[-0.25px] text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/* Body Large */
export const BodyLarge = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[1.25rem] font-semibold leading-[1.4] tracking-[-0.125px] text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
BodyLarge.displayName = 'BodyLarge';

/* Body */
export const Body = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-base font-normal leading-relaxed text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
Body.displayName = 'Body';

/* Body Medium */
export const BodyMedium = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-base font-medium leading-relaxed text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
BodyMedium.displayName = 'BodyMedium';

/* Body Semibold */
export const BodySemibold = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-base font-semibold leading-relaxed text-[rgba(0,0,0,0.95)]',
      className
    )}
    {...props}
  />
));
BodySemibold.displayName = 'BodySemibold';

/* Caption */
export const Caption = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[0.875rem] font-medium leading-[1.43] text-[#615d59]',
      className
    )}
    {...props}
  />
));
Caption.displayName = 'Caption';

/* Caption Light */
export const CaptionLight = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[0.875rem] font-normal leading-[1.43] text-[#615d59]',
      className
    )}
    {...props}
  />
));
CaptionLight.displayName = 'CaptionLight';

/* Micro Label */
export const MicroLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[0.75rem] font-normal leading-[1.33] text-[#a39e98]',
      className
    )}
    {...props}
  />
));
MicroLabel.displayName = 'MicroLabel';

/* Secondary Text */
export const SecondaryText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-base font-normal leading-relaxed text-[#615d59]',
      className
    )}
    {...props}
  />
));
SecondaryText.displayName = 'SecondaryText';

/* Muted Text */
export const MutedText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-base font-normal leading-relaxed text-[#a39e98]',
      className
    )}
    {...props}
  />
));
MutedText.displayName = 'MutedText';
