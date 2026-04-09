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
  const { projects, criteria, loading, error } = useProjects();
  const [submittedInfo, setSubmittedInfo] = useState<UserInfo | null>(null);
  const [initialValues] = useState<UserInfo | null>(readStoredUserInfo);
  const resultsRef = useRef<HTMLDivElement>(null);

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
      {/* Header */}
      <header className="border-b py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">
              Nhà Ở Xã Hội
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Tìm dự án phù hợp với điều kiện của bạn
              {updatedAt &&
                ` · Cập nhật ${new Date(updatedAt).toLocaleString('vi-VN')}`}
            </p>
          </div>
          {projects.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
              {projects.length} dự án
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Left: Form — sticky */}
          <aside className="w-full shrink-0 md:sticky md:top-6 md:w-85">
            <div className="bg-muted/40 rounded-xl border p-5">
              <p className="text-muted-foreground mb-4 text-[11px] font-semibold tracking-[0.5px] uppercase">
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
            </div>
          </aside>

          {/* Right: Results */}
          <section ref={resultsRef} className="min-w-0 flex-1">
            <ProjectList
              results={results}
              hasChecked={hasChecked}
              loading={loading}
              error={error}
              updatedAt={updatedAt}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
