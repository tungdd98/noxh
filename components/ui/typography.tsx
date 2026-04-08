import * as React from 'react';
import { cn } from '@/lib/utils';

export function Display({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-[36px] leading-tight font-bold tracking-[-1px] [font-variant-numeric:tabular-nums]',
        className
      )}
      {...props}
    />
  );
}

export function H1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn('text-[28px] font-bold tracking-[-0.5px]', className)}
      {...props}
    />
  );
}

export function H2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-[22px] font-semibold tracking-[-0.3px]', className)}
      {...props}
    />
  );
}

export function H3({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-[17px] font-semibold tracking-[-0.1px]', className)}
      {...props}
    />
  );
}

export function Body({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-foreground text-sm', className)} {...props} />;
}

export function Caption({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-muted-foreground text-xs tracking-[0.1px]',
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase',
        className
      )}
      {...props}
    />
  );
}
