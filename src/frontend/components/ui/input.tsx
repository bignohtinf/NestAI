import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-[4px] border border-[#dddddd] bg-white px-3 py-2 text-base font-normal text-[rgba(0,0,0,0.9)] placeholder:text-[#a39e98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#097fe8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
