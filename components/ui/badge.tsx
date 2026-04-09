import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-2 border-border bg-primary text-primary-foreground',
        secondary:
          'border-[1.5px] border-muted-border bg-muted text-muted-foreground',
        destructive:
          'border-[1.5px] border-destructive bg-destructive-bg text-destructive-foreground',
        outline: 'border-[1.5px] border-border text-foreground',
        ghost: 'text-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
        success: 'border-[1.5px] border-success bg-success-bg text-success',
        warning: 'border-[1.5px] border-warning bg-warning-bg text-warning',
        info: 'border-[1.5px] border-info bg-info-bg text-info-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
