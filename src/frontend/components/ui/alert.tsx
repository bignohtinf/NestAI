import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-[8px] border border-black/10 p-4 text-sm',
  {
    variants: {
      variant: {
        default: 'bg-white text-[rgba(0,0,0,0.95)]',
        success: 'bg-[#1aae39]/5 text-[#1aae39] border-[#1aae39]/20',
        warning: 'bg-[#dd5b00]/5 text-[#dd5b00] border-[#dd5b00]/20',
        error: 'bg-[#e74c3c]/5 text-[#e74c3c] border-[#e74c3c]/20',
        info: 'bg-[#0075de]/5 text-[#0075de] border-[#0075de]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription, alertVariants };
