import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full text-[0.75rem] font-semibold tracking-[0.125px] px-2 py-1',
  {
    variants: {
      variant: {
        default: 'bg-[#f2f9ff] text-[#097fe8]',
        success: 'bg-[#1aae39]/10 text-[#1aae39]',
        warning: 'bg-[#dd5b00]/10 text-[#dd5b00]',
        error: 'bg-[#e74c3c]/10 text-[#e74c3c]',
        teal: 'bg-[#2a9d99]/10 text-[#2a9d99]',
        purple: 'bg-[#391c57]/10 text-[#391c57]',
        brown: 'bg-[#523410]/10 text-[#523410]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
