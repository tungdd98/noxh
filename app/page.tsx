'use client';

import { useState, useRef } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useEligibility } from '@/hooks/use-eligibility';
import { UserForm } from '@/components/user-form';
import { ProjectList } from '@/components/project-list';
import type { UserInfo } from '@/types/noxh';

const LOCAL_STORAGE_KEY = 'noxh_user_info';

function readStoredUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as UserInfo) : null;
  } catch {
    return null;
  }
}

export default function NOXHPage() {
  const [submittedInfo, setSubmittedInfo] = useState<UserInfo | null>(null);
  const [initialValues] = useState<UserInfo | null>(readStoredUserInfo);
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { projects, criteria, loading, error, totalCount } = useProjects(
    submittedInfo,
    page
  );
  const results = useEligibility(submittedInfo, projects, criteria);
  const hasChecked = submittedInfo !== null;

  const updatedAt =
    projects.length > 0
      ? projects.reduce(
          (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
          projects[0].updatedAt
        )
      : null;

  function handleSubmit(info: UserInfo) {
    setPage(1);
    setSubmittedInfo(info);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
    } catch {
      // ignore storage errors
    }
    if (window.innerWidth < 768) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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
          {updatedAt && (
            <div className="border-primary bg-secondary text-secondary-foreground mb-4 inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-1.5 text-xs font-bold">
              <span className="bg-primary h-2 w-2 rounded-full" />
              Dữ liệu cập nhật {new Date(updatedAt).toLocaleDateString('vi-VN')}
            </div>
          )}
          <h1 className="text-foreground mb-2 text-4xl leading-tight font-black md:text-5xl">
            Tra cứu điều kiện mua{' '}
            <span className="text-primary">nhà ở xã hội</span>
          </h1>
          <p className="text-muted-foreground mb-6 max-w-lg text-sm">
            Nhập thông tin của bạn — hệ thống tự động lọc các dự án đủ điều kiện
            tức thì.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:grid md:grid-cols-[300px_1fr]">
          <aside className="border-border bg-card border-b-2 p-6 md:sticky md:top-[60px] md:h-[calc(100vh-60px)] md:overflow-y-auto md:border-r-2 md:border-b-0">
            <p className="text-primary mb-5 text-[11px] font-extrabold tracking-widest uppercase">
              Thông tin của bạn
            </p>
            {criteria ? (
              <UserForm
                criteria={criteria}
                initialValues={initialValues}
                onSubmit={handleSubmit}
              />
            ) : loading ? (
              <p className="text-muted-foreground text-sm">Đang tải...</p>
            ) : (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </aside>

          <section ref={resultsRef} className="min-w-0 p-6">
            <ProjectList
              results={results}
              hasChecked={hasChecked}
              loading={loading}
              error={error}
              updatedAt={updatedAt}
              page={page}
              setPage={setPage}
              totalCount={totalCount}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
