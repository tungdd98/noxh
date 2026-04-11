'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useScoring } from '@/hooks/use-scoring';
import { UserForm } from '@/components/user-form';
import { ProjectList } from '@/components/project-list';
import type { UserInfo, CriteriaWeights } from '@/types/noxh';

const PAGE_SIZE = 10;

export default function NOXHPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const {
    scored,
    loading: scoringLoading,
    error: scoringError,
    score,
  } = useScoring(projects);

  const hasScored = scored.length > 0;
  const displayProjects = hasScored ? scored : projects;
  const totalCount = displayProjects.length;
  const pagedProjects = displayProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleFormSubmit(info: UserInfo, weights: CriteriaWeights) {
    setCurrentPage(1);
    await score(info, weights);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const loading = projectsLoading || scoringLoading;
  const error = projectsError ?? scoringError;

  return (
    <main className="bg-background text-foreground min-h-screen">
      <header className="bg-background border-border sticky top-0 z-10 flex h-15 items-center justify-between border-b-2 px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary border-border flex h-9 w-9 items-center justify-center rounded-[8px] border-2 text-lg shadow-[2px_2px_0_var(--border)]">
            🏠
          </div>
          <span className="text-foreground text-lg font-extrabold">
            Nhà Ở Xã Hội
          </span>
        </div>
        {totalCount > 0 && (
          <span className="border-primary bg-secondary text-secondary-foreground rounded-full border-[1.5px] px-3 py-1 text-xs font-bold">
            {totalCount} dự án{hasScored ? ' • đã xếp hạng' : ''}
          </span>
        )}
      </header>

      <div className="bg-background border-border border-b-2 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-foreground mb-2 text-4xl leading-tight font-black md:text-5xl">
            Danh sách <span className="text-primary">nhà ở xã hội</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm">
            {hasScored
              ? 'Dự án đã được xếp hạng theo mức độ phù hợp với bạn.'
              : 'Nhập thông tin của bạn để tìm dự án phù hợp nhất.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:grid md:grid-cols-[300px_1fr]">
          <aside className="border-border bg-card border-b-2 p-6 md:sticky md:top-15 md:h-[calc(100vh-60px)] md:overflow-y-auto md:border-r-2 md:border-b-0">
            <p className="text-primary mb-5 text-xs font-extrabold tracking-widest uppercase">
              Thông tin của bạn
            </p>
            <UserForm onSubmit={handleFormSubmit} loading={scoringLoading} />
          </aside>

          <section className="min-w-0 p-6">
            <ProjectList
              projects={pagedProjects}
              totalCount={totalCount}
              currentPage={currentPage}
              loading={loading}
              error={error}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
