import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<'button'>;

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <button
      data-slot="pagination-link"
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'default' : 'outline',
          size: 'icon-sm',
        }),
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      data-slot="pagination-previous"
      aria-label="Trang trước"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'icon-sm' }),
        className
      )}
      {...props}
    >
      <ChevronLeft />
      <span className="sr-only">Trang trước</span>
    </button>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      data-slot="pagination-next"
      aria-label="Trang sau"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'icon-sm' }),
        className
      )}
      {...props}
    >
      <ChevronRight />
      <span className="sr-only">Trang sau</span>
    </button>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn(
        'text-muted-foreground flex size-7 items-center justify-center select-none',
        className
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
