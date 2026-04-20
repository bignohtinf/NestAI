import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'warm-white';
  padded?: boolean;
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, variant = 'white', padded = true, ...props }, ref) => {
    const bgColor = variant === 'warm-white' ? 'bg-[#f6f5f4]' : 'bg-white';
    const padding = padded ? 'py-16 px-4 md:py-20 md:px-8' : '';

    return (
      <section
        ref={ref}
        className={cn(bgColor, padding, className)}
        {...props}
      />
    );
  }
);
Section.displayName = 'Section';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = 'lg', ...props }, ref) => {
    const maxWidthClass = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-4xl',
      xl: 'max-w-5xl',
      '2xl': 'max-w-6xl',
      full: 'max-w-full',
    }[maxWidth];

    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full', maxWidthClass, className)}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 3, gap = 'md', ...props }, ref) => {
    const colsClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }[cols];

    const gapClass = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    }[gap];

    return (
      <div
        ref={ref}
        className={cn('grid', colsClass, gapClass, className)}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

export { Section, Container, Grid };
