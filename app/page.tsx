'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { UserForm } from '@/components/user-form';
import { ProjectList } from '@/components/project-list';

export default function NOXHPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { projects, totalCount, loading, error } = useProjects(currentPage);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <header className="bg-background border-border sticky top-0 z-10 flex h-[60px] items-center justify-between border-b-2 px-6">
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
            {totalCount} dự án
          </span>
        )}
      </header>

      <div className="bg-background border-border border-b-2 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-foreground mb-2 text-4xl leading-tight font-black md:text-5xl">
            Danh sách <span className="text-primary">nhà ở xã hội</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm">
            Tổng hợp các dự án nhà ở xã hội tại Hà Nội.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:grid md:grid-cols-[300px_1fr]">
          <aside className="border-border bg-card border-b-2 p-6 md:sticky md:top-[60px] md:h-[calc(100vh-60px)] md:overflow-y-auto md:border-r-2 md:border-b-0">
            <p className="text-primary mb-5 text-[11px] font-extrabold tracking-widest uppercase">
              Thông tin của bạn
            </p>
            <UserForm onSubmit={() => {}} />
          </aside>

          <section className="min-w-0 p-6">
            <ProjectList
              projects={projects}
              totalCount={totalCount}
              currentPage={currentPage}
              loading={loading}
              error={error}
              onPageChange={handlePageChange}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
