'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Project, ScoredProject, CriteriaWeights } from '@/types/noxh';

type Props = {
  project: Project | ScoredProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weights?: CriteriaWeights;
};

type InfoRowProps = {
  label: string;
  value: string | null;
  className?: string;
};

function isScoredProject(p: Project | ScoredProject): p is ScoredProject {
  return 'totalScore' in p;
}

function InfoRow({ label, value, className }: Readonly<InfoRowProps>) {
  if (!value || value === '--') return null;
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
        {label}
      </span>
      <span className="text-foreground text-sm font-semibold whitespace-pre-line">
        {value}
      </span>
    </div>
  );
}

type ScoreBarProps = { label: string; score: number | null };

function ScoreBar({ label, score }: ScoreBarProps) {
  if (score === null) return null;
  const color =
    score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/100</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ProjectDetailModal({
  project,
  open,
  onOpenChange,
  weights,
}: Readonly<Props>) {
  const scored = project && isScoredProject(project) ? project : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        {project && (
          <>
            <div className="bg-muted relative aspect-video w-full shrink-0">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🏠
                </div>
              )}
            </div>

            <div className="p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl leading-tight font-extrabold">
                  {project.title}
                </DialogTitle>
                {project.status && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="border-muted-border bg-muted text-muted-foreground shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold">
                      {project.status}
                    </span>
                  </div>
                )}
              </DialogHeader>

              {/* Score breakdown section */}
              {scored && (
                <div className="border-border mb-6 space-y-3 rounded-[10px] border-2 p-4">
                  <p className="text-primary text-xs font-extrabold tracking-widest uppercase">
                    Điểm phù hợp với bạn — {scored.totalScore}/100
                  </p>
                  {!scored.scoreBreakdown.eligible && (
                    <p className="text-xs font-semibold text-red-500">
                      ⚠️ Bạn có thể không đủ điều kiện cho dự án này
                    </p>
                  )}
                  {(!weights || weights.finance !== 'off') && (
                    <ScoreBar
                      label="Tài chính"
                      score={scored.scoreBreakdown.finance}
                    />
                  )}
                  {(!weights || weights.location !== 'off') && (
                    <ScoreBar
                      label="Vị trí"
                      score={scored.scoreBreakdown.location}
                    />
                  )}
                  {(!weights || weights.urgency !== 'off') && (
                    <ScoreBar
                      label="Urgency"
                      score={scored.scoreBreakdown.urgency}
                    />
                  )}
                  {(!weights || weights.investorReputation !== 'off') && (
                    <ScoreBar
                      label="Uy tín CĐT"
                      score={scored.scoreBreakdown.investorReputation}
                    />
                  )}
                  {scored.distanceKm !== null && (
                    <p className="text-muted-foreground text-xs">
                      📍 Cách nơi làm việc {scored.distanceKm}km (đường chim
                      bay)
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow label="Giá bán" value={project.price} />
                <InfoRow label="Bàn giao" value={project.handover} />
                <InfoRow
                  label="Địa chỉ"
                  value={project.address}
                  className="sm:col-span-2"
                />
                <InfoRow
                  label="Nhà đầu tư"
                  value={project.owner}
                  className="sm:col-span-2"
                />
                <InfoRow
                  label="Thời gian thu hồ sơ"
                  value={project.applyTime}
                  className="sm:col-span-2"
                />
                <InfoRow
                  label="Quy mô"
                  value={project.scale}
                  className="sm:col-span-2"
                />
                <InfoRow label="Diện tích khu đất" value={project.area} />
                <InfoRow label="Mật độ xây dựng" value={project.density} />
                <InfoRow
                  label="Phí bảo trì"
                  value={project.maintenance}
                  className="sm:col-span-2"
                />
              </div>

              {project.url && (
                <div className="mt-6 flex justify-end">
                  <Button asChild>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      Xem bài viết
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
