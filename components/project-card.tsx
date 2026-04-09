import { cn } from '@/lib/utils';
import type { ProjectResult, EligibilityStatus } from '@/types/noxh';

const STATUS_CONFIG: Record<
  'open' | 'upcoming' | 'pending',
  { label: string; className: string }
> = {
  open: {
    label: 'Đang nhận hồ sơ',
    className: 'border-[1.5px] border-success bg-success-bg text-success',
  },
  upcoming: {
    label: 'Sắp mở',
    className: 'border-[1.5px] border-warning bg-warning-bg text-warning',
  },
  pending: {
    label: 'Chưa chốt lịch',
    className:
      'border-[1.5px] border-muted-border bg-muted text-muted-foreground',
  },
};

const ELIGIBILITY_BADGE: Record<
  EligibilityStatus,
  { className: string; label: string }
> = {
  eligible: {
    className: 'border-[1.5px] border-success bg-success-bg text-success',
    label: 'Đủ điều kiện',
  },
  wrong_province: {
    className: 'border-[1.5px] border-warning bg-warning-bg text-warning',
    label: 'Không đúng tỉnh',
  },
  income_exceeded: {
    className:
      'border-[1.5px] border-destructive bg-destructive-bg text-destructive-foreground',
    label: 'Thu nhập vượt mức',
  },
  wrong_category: {
    className: 'border-[1.5px] border-warning bg-warning-bg text-warning',
    label: 'Không đúng đối tượng',
  },
  housing_ineligible: {
    className:
      'border-[1.5px] border-destructive bg-destructive-bg text-destructive-foreground',
    label: 'Không đủ ĐK nhà ở',
  },
  previously_bought: {
    className:
      'border-[1.5px] border-destructive bg-destructive-bg text-destructive-foreground',
    label: 'Đã từng mua NOXH',
  },
  restricted: {
    className:
      'border-[1.5px] border-muted-border bg-muted text-muted-foreground',
    label: 'Dự án giới hạn đối tượng',
  },
};

function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return 'Chưa công bố';
  if (!max) return `Từ ${min}tr`;
  if (!min) return `Đến ${max}tr`;
  return min >= 1000
    ? `${(min / 1000).toFixed(1)}–${(max / 1000).toFixed(1)} tỷ`
    : `${min}–${max}tr`;
}

function formatArea(min: number | null, max: number | null): string {
  if (!min && !max) return '';
  if (!max) return `${min}m²`;
  return `${min}–${max}m²`;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

type Props = { project: ProjectResult; rank?: number };

export function ProjectCard({ project, rank }: Props) {
  const eligibility = ELIGIBILITY_BADGE[project.eligibilityStatus];
  const statusCfg = STATUS_CONFIG[project.statusType];
  const isEligible = project.eligibilityStatus === 'eligible';
  const areaStr = formatArea(project.minArea, project.maxArea);

  return (
    <div
      className={cn(
        'bg-card rounded-[14px] border-2 p-4 transition-all',
        isEligible
          ? 'border-border shadow-[3px_3px_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--border)]'
          : 'border-muted-border opacity-55 shadow-[2px_2px_0_var(--muted-border)]'
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          {rank && rank <= 3 && (
            <span className="mt-px shrink-0 text-base leading-none">
              {RANK_MEDALS[rank - 1]}
            </span>
          )}
          <h3 className="text-foreground text-sm leading-tight font-extrabold">
            {project.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {project.tag && (
            <span className="border-success bg-success-bg text-success rounded-full border-[1.5px] px-2 py-0.5 text-[10px] font-bold">
              {project.tag}
            </span>
          )}
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
              eligibility.className
            )}
          >
            {eligibility.label}
          </span>
        </div>
      </div>

      <p className="text-muted-foreground mb-2 text-xs">
        {project.district} · {project.province}
      </p>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {areaStr && (
          <span className="border-muted-border bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[11px] font-semibold">
            📐 {areaStr}
          </span>
        )}
        <span className="border-muted-border bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[11px] font-semibold">
          💰 {formatPrice(project.minPrice, project.maxPrice)}
        </span>
        <span className="border-muted-border bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[11px] font-semibold">
          🏠 {project.totalUnits} căn
        </span>
        {project.handover && project.handover !== 'Chưa công bố' && (
          <span className="border-muted-border bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[11px] font-semibold">
            📅 {project.handover}
          </span>
        )}
      </div>

      <div
        className={cn(
          'inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold',
          statusCfg.className
        )}
      >
        {project.status}
      </div>

      {!isEligible && project.ineligibleReasons.length > 0 && (
        <p className="text-muted-foreground mt-2 text-[11px]">
          Lý do: {project.ineligibleReasons.join(' · ')}
        </p>
      )}
    </div>
  );
}
