import Image from 'next/image';
import { MapPin, Building2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/noxh';

type Props = { project: Project };

export function ProjectCard({ project }: Readonly<Props>) {
  return (
    <a
      href={project.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'bg-card border-border flex overflow-hidden rounded-[14px] border-2 transition-all',
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
            sizes="120px"
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

        <div className="flex flex-col gap-x-3 gap-y-1">
          {project.capacity && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Home className="h-3 w-3 shrink-0" />
              {project.capacity}
            </span>
          )}
          {project.owner && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.owner}</span>
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
    </a>
  );
}
