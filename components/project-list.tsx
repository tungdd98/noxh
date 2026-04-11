'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/project-card';
import { ProjectDetailModal } from '@/components/project-detail-modal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { Project, ScoredProject, CriteriaWeights } from '@/types/noxh';

type Props = {
  projects: (Project | ScoredProject)[];
  totalCount: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  pageSize: number;
  rankOffset?: number;
  weights?: CriteriaWeights;
};

export function ProjectList({
  projects,
  totalCount,
  currentPage,
  loading,
  error,
  onPageChange,
  pageSize,
  rankOffset = 0,
  weights,
}: Readonly<Props>) {
  const [selectedProject, setSelectedProject] = useState<
    Project | ScoredProject | null
  >(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border bg-card flex animate-pulse overflow-hidden rounded-[14px] border-2 shadow-[3px_3px_0_var(--border)]"
          >
            <div className="bg-muted aspect-square w-40 shrink-0" />
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

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs font-extrabold tracking-widest uppercase">
          {totalCount} dự án
        </p>

        <div className="space-y-3">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              rank={rankOffset + i + 1}
              weights={weights}
              onClick={() => setSelectedProject(project)}
            />
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
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
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

      <ProjectDetailModal
        project={selectedProject}
        open={selectedProject !== null}
        weights={weights}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      />
    </>
  );
}
