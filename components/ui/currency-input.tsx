'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const formatter = new Intl.NumberFormat('vi-VN');

function formatVND(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return formatter.format(Number(digits));
}

export interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value'
> {
  value?: number | '';
  onChange?: (value: number | '') => void;
}

function CurrencyInput({
  className,
  value,
  onChange,
  ...props
}: CurrencyInputProps) {
  const displayValue =
    value === '' || value === undefined ? '' : formatter.format(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    if (!onChange) return;
    onChange(digits === '' ? '' : Number(digits));
  }

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          'border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full min-w-0 rounded-md border px-3 py-1 pr-10 text-sm [font-variant-numeric:tabular-nums] shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      <span className="text-muted-foreground pointer-events-none absolute right-3 text-sm select-none">
        ₫
      </span>
    </div>
  );
}

export { CurrencyInput, formatVND };
