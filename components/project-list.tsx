import { ProjectCard } from '@/components/project-card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { Project } from '@/types/noxh';

const PAGE_SIZE = 10;

type Props = {
  projects: Project[];
  totalCount: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
};

export function ProjectList({
  projects,
  totalCount,
  currentPage,
  loading,
  error,
  onPageChange,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border bg-card flex animate-pulse overflow-hidden rounded-[14px] border-2 shadow-[3px_3px_0_var(--border)]"
          >
            <div className="bg-muted h-[90px] w-[120px] shrink-0" />
            <div className="flex-1 p-3">
              <div className="bg-muted mb-2 h-4 w-3/5 rounded-md" />
              <div className="bg-muted mb-3 h-3 w-2/5 rounded" />
              <div className="flex gap-2">
                <div className="bg-muted h-4 w-16 rounded-md" />
                <div className="bg-muted h-4 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex h-40 items-center justify-center text-sm font-semibold">
        {error}
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-[11px] font-extrabold tracking-widest uppercase">
        {totalCount} dự án
      </p>

      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                return (
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
                );
              })
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
