import { ProjectCard } from '@/components/project-card';
import type { ProjectResult } from '@/types/noxh';

type Props = {
  results: ProjectResult[];
  hasChecked: boolean;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

export function ProjectList({
  results,
  hasChecked,
  loading,
  error,
  updatedAt,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border bg-card animate-pulse rounded-[14px] border-2 p-4 shadow-[3px_3px_0_var(--border)]"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="bg-muted h-4 w-3/5 rounded-md" />
              <div className="bg-muted h-5 w-20 rounded-full" />
            </div>
            <div className="bg-muted mb-3 h-3 w-2/5 rounded" />
            <div className="flex gap-2">
              <div className="bg-muted h-6 w-16 rounded-md" />
              <div className="bg-muted h-6 w-20 rounded-md" />
              <div className="bg-muted h-6 w-14 rounded-md" />
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

  if (!hasChecked) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="border-success bg-success-bg flex h-16 w-16 items-center justify-center rounded-[16px] border-2 text-3xl shadow-[3px_3px_0_var(--border)]">
          🏠
        </div>
        <div>
          <p className="text-foreground mb-1 text-base font-extrabold">
            Nhập thông tin để bắt đầu
          </p>
          <p className="text-muted-foreground text-sm">
            Điền form bên trái và nhấn &quot;Kiểm tra&quot; để xem dự án phù hợp
          </p>
          {updatedAt && (
            <p className="text-muted-foreground mt-2 text-xs">
              Dữ liệu cập nhật: {new Date(updatedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
      </div>
    );
  }

  const eligibleCount = results.filter(
    (r) => r.eligibilityStatus === 'eligible'
  ).length;
  const ineligibleCount = results.length - eligibleCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[11px] font-extrabold tracking-widest uppercase">
          {results.length} dự án
        </p>
        <div className="flex gap-2">
          {eligibleCount > 0 && (
            <span className="border-success bg-success-bg text-success rounded-full border-[1.5px] px-3 py-1 text-xs font-bold">
              {eligibleCount} đủ ĐK
            </span>
          )}
          {ineligibleCount > 0 && (
            <span className="border-destructive bg-destructive-bg text-destructive-foreground rounded-full border-[1.5px] px-3 py-1 text-xs font-bold">
              {ineligibleCount} không đủ
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {(() => {
          let eligibleRank = 0;
          return results.map((project) => {
            const rank =
              project.eligibilityStatus === 'eligible' && eligibleRank < 3
                ? ++eligibleRank
                : undefined;
            return (
              <ProjectCard key={project.id} project={project} rank={rank} />
            );
          });
        })()}
      </div>
    </div>
  );
}
