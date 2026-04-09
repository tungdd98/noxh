import { Badge } from '@/components/ui/badge';
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
      <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
        Đang tải dữ liệu dự án...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex h-40 items-center justify-center text-sm">
        {error}
      </div>
    );
  }

  if (!hasChecked) {
    return (
      <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 text-center text-sm">
        <span className="text-3xl">🏠</span>
        <p>
          Nhập thông tin bên trái và nhấn &quot;Kiểm tra&quot; để xem dự án phù
          hợp
        </p>
        {updatedAt && (
          <p className="text-xs">
            Dữ liệu cập nhật: {new Date(updatedAt).toLocaleString('vi-VN')}
          </p>
        )}
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
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase">
          {results.length} dự án
        </p>
        <div className="flex gap-2">
          {eligibleCount > 0 && (
            <Badge variant="success">{eligibleCount} đủ ĐK</Badge>
          )}
          {ineligibleCount > 0 && (
            <Badge variant="destructive">{ineligibleCount} không đủ</Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
