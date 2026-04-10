import Image from 'next/image';
import { MapPin, Building2, Home, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseTotalUnits } from '@/lib/project-utils';
import type { Project } from '@/types/noxh';

type Props = {
  project: Project;
  onClick: () => void;
};

export function ProjectCard({ project, onClick }: Readonly<Props>) {
  const totalUnits = parseTotalUnits(project.scale);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card border-border flex w-full overflow-hidden rounded-2xl border-2 text-left transition-all',
        'shadow-[3px_3px_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--border)]'
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
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <h3 className="text-foreground mb-0.5 line-clamp-1 text-base leading-tight font-extrabold">
            {project.title}
          </h3>
          {project.address && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.address}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-y-1">
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
