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
import type { Project } from '@/types/noxh';

type Props = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type InfoRowProps = {
  label: string;
  value: string | null;
  className?: string;
};

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

export function ProjectDetailModal({
  project,
  open,
  onOpenChange,
}: Readonly<Props>) {
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
