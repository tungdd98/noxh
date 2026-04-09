import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProjectResult, EligibilityStatus } from '@/types/noxh';

const STATUS_CONFIG: Record<
  'open' | 'upcoming' | 'pending',
  { label: string; className: string }
> = {
  open: {
    label: 'Đang nhận hồ sơ',
    className: 'bg-[#22c55e]/10 text-[#15803d]',
  },
  upcoming: { label: 'Sắp mở', className: 'bg-[#f59e0b]/10 text-[#92400e]' },
  pending: {
    label: 'Chưa chốt lịch',
    className: 'bg-muted text-muted-foreground',
  },
};

const ELIGIBILITY_BADGE: Record<
  EligibilityStatus,
  {
    variant: 'success' | 'warning' | 'destructive' | 'secondary';
    label: string;
  }
> = {
  eligible: { variant: 'success', label: 'Đủ điều kiện' },
  wrong_province: { variant: 'warning', label: 'Không đúng tỉnh' },
  income_exceeded: { variant: 'destructive', label: 'Thu nhập vượt mức' },
  wrong_category: { variant: 'warning', label: 'Không đúng đối tượng' },
  housing_ineligible: { variant: 'destructive', label: 'Không đủ ĐK nhà ở' },
  previously_bought: { variant: 'destructive', label: 'Đã từng mua NOXH' },
  restricted: { variant: 'secondary', label: 'Dự án giới hạn đối tượng' },
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
    <Card
      className={cn(
        'overflow-hidden transition-opacity',
        !isEligible && 'opacity-75'
      )}
    >
      <CardContent className="space-y-2 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {rank && rank <= 3 && (
              <span className="mt-px shrink-0 text-base leading-none">
                {RANK_MEDALS[rank - 1]}
              </span>
            )}
            <h3 className="text-sm leading-tight font-semibold">
              {project.name}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {project.tag && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-bold">
                {project.tag}
              </span>
            )}
            <Badge variant={eligibility.variant}>{eligibility.label}</Badge>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">
          {project.district} · {project.province}
        </p>

        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {areaStr && <span>📐 {areaStr}</span>}
          <span>💰 {formatPrice(project.minPrice, project.maxPrice)}</span>
          <span>🏠 {project.totalUnits} căn</span>
          {project.handover && project.handover !== 'Chưa công bố' && (
            <span>📅 {project.handover}</span>
          )}
        </div>

        <div
          className={cn(
            'rounded-md px-2.5 py-1.5 text-xs font-medium',
            statusCfg.className
          )}
        >
          {project.status}
        </div>

        {!isEligible && project.ineligibleReasons.length > 0 && (
          <p className="text-muted-foreground text-[11px]">
            Lý do: {project.ineligibleReasons.join(' · ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
