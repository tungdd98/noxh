import Image from 'next/image';
import {
  MapPin,
  Building2,
  Home,
  CalendarDays,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseTotalUnits } from '@/lib/project-utils';
import type { Project, ScoredProject } from '@/types/noxh';

type Props = {
  project: Project | ScoredProject;
  onClick: () => void;
};

function isScoredProject(p: Project | ScoredProject): p is ScoredProject {
  return 'totalScore' in p;
}

function ScoreBadge({ score, eligible }: { score: number; eligible: boolean }) {
  const color = !eligible
    ? 'bg-destructive text-destructive-foreground'
    : score >= 70
      ? 'bg-green-600 text-white'
      : score >= 40
        ? 'bg-amber-500 text-white'
        : 'bg-red-500 text-white';

  return (
    <div
      className={cn(
        'absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shadow-[2px_2px_0_rgba(0,0,0,0.3)]',
        color
      )}
    >
      {score}
    </div>
  );
}

export function ProjectCard({ project, onClick }: Readonly<Props>) {
  const totalUnits = parseTotalUnits(project.scale);
  const scored = isScoredProject(project) ? project : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card border-border flex w-full overflow-hidden rounded-2xl border-2 text-left transition-all',
        'shadow-[3px_3px_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--border)]',
        scored && !scored.scoreBreakdown.eligible && 'opacity-60'
      )}
    >
      <div className="bg-muted relative aspect-square w-40 shrink-0">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="160px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🏠
          </div>
        )}

        {scored && (
          <ScoreBadge
            score={scored.totalScore}
            eligible={scored.scoreBreakdown.eligible}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <h3 className="text-foreground line-clamp-1 text-base leading-tight font-extrabold">
              {project.title}
            </h3>
            {scored && !scored.scoreBreakdown.eligible && (
              <span className="shrink-0 rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-black text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Không đủ điều kiện
              </span>
            )}
          </div>
          {project.address && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.address}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-y-1">
          {scored?.distanceKm !== null && scored?.distanceKm !== undefined && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Navigation className="h-3 w-3 shrink-0" />
              {scored.distanceKm}km từ nơi làm việc
            </span>
          )}

          {totalUnits !== null && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Home className="h-3 w-3 shrink-0" />
              {totalUnits.toLocaleString('vi-VN')} căn
            </span>
          )}

          {project.owner && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.owner}</span>
            </span>
          )}

          {project.applyTime && project.applyTime !== '--' && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.applyTime}</span>
            </span>
          )}
        </div>

        <div className="mt-1.5 flex justify-end gap-2">
          {project.status && (
            <span className="border-muted-border bg-muted text-muted-foreground shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold">
              {project.status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
