import Image from 'next/image';
import {
  MapPin,
  Building2,
  Home,
  CalendarDays,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseTotalUnits, getStatusStyle } from '@/lib/project-utils';
import type { Project, ScoredProject, CriteriaWeights } from '@/types/noxh';

type Props = {
  project: Project | ScoredProject;
  rank?: number;
  weights?: CriteriaWeights;
  onClick: () => void;
};

function isScoredProject(p: Project | ScoredProject): p is ScoredProject {
  return 'totalScore' in p;
}

// ─── Rank badge ────────────────────────────────────────────────────────────────

const RANK_CONFIG = {
  1: {
    icon: '🥇',
    badge: 'bg-yellow-400 text-yellow-900',
    border:
      'ring-2 ring-yellow-400 shadow-[0_8px_0_0_rgba(202,138,4,0.45),0_12px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(202,138,4,0.5),0_18px_24px_rgba(0,0,0,0.1)]',
  },
  2: {
    icon: '🥈',
    badge: 'bg-zinc-300 text-zinc-800',
    border:
      'ring-2 ring-zinc-300 shadow-[0_8px_0_0_rgba(161,161,170,0.5),0_12px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(161,161,170,0.55),0_18px_24px_rgba(0,0,0,0.1)]',
  },
  3: {
    icon: '🥉',
    badge: 'bg-amber-600 text-white',
    border:
      'ring-2 ring-amber-500 shadow-[0_8px_0_0_rgba(217,119,6,0.45),0_12px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(217,119,6,0.5),0_18px_24px_rgba(0,0,0,0.1)]',
  },
} as const;

// ─── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, eligible }: { score: number; eligible: boolean }) {
  const bgColor = !eligible
    ? 'bg-destructive text-destructive-foreground'
    : score >= 70
      ? 'bg-green-600 text-white'
      : score >= 40
        ? 'bg-amber-500 text-white'
        : 'bg-red-500 text-white';

  return (
    <div
      className={cn(
        'absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-[0_4px_0_0_rgba(0,0,0,0.2)]',
        bgColor
      )}
    >
      {score}
    </div>
  );
}

function MedalBadge({ rank }: { rank: 1 | 2 | 3 }) {
  const cfg = RANK_CONFIG[rank];
  return (
    <div
      className={cn(
        'absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full text-base shadow-[1px_1px_0_rgba(0,0,0,0.2)]',
        cfg.badge
      )}
    >
      {cfg.icon}
    </div>
  );
}

// ─── Criteria mini-scores ──────────────────────────────────────────────────────

const CRITERIA_CHIPS = [
  { key: 'finance' as const, icon: '💰', label: 'TC' },
  { key: 'location' as const, icon: '📍', label: 'VT' },
  { key: 'urgency' as const, icon: '⏰', label: 'UG' },
  { key: 'investorReputation' as const, icon: '🏢', label: 'CĐT' },
] as const;

function criteriaColor(score: number | null): string {
  if (score === null) return 'bg-muted text-muted-foreground';
  if (score >= 70) return 'bg-emerald-100 text-emerald-700';
  if (score >= 40) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-600';
}

function CriteriaMiniScores({
  scored,
  weights,
}: {
  scored: ScoredProject;
  weights?: CriteriaWeights;
}) {
  const visibleChips = CRITERIA_CHIPS.filter(
    ({ key }) => !weights || weights[key] !== 'off'
  );
  if (visibleChips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {visibleChips.map(({ key, icon }) => {
        const score = scored.scoreBreakdown[key];
        return (
          <span
            key={key}
            className={cn(
              'flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[10px] font-bold',
              criteriaColor(score)
            )}
          >
            {icon}
            <span>{score ?? '—'}</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export function ProjectCard({
  project,
  rank,
  weights,
  onClick,
}: Readonly<Props>) {
  const totalUnits = parseTotalUnits(project.scale);
  const scored = isScoredProject(project) ? project : null;
  const rankCfg = rank && rank <= 3 ? RANK_CONFIG[rank as 1 | 2 | 3] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card relative flex w-full flex-col overflow-hidden rounded-[24px] text-left transition-all duration-200 sm:flex-row',
        rankCfg
          ? rankCfg.border
          : 'shadow-[0_8px_0_0_rgba(234,88,12,0.18),0_12px_24px_rgba(0,0,0,0.07)] hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(234,88,12,0.22),0_18px_28px_rgba(0,0,0,0.09)]',
        scored && !scored.scoreBreakdown.eligible && 'opacity-60'
      )}
    >
      {/* Thumbnail */}
      <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden rounded-t-[24px] sm:aspect-square sm:w-40 sm:shrink-0 sm:rounded-t-none sm:rounded-l-[24px]">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 160px, 100vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🏠
          </div>
        )}
        {/* Medal icon — top-left of thumbnail */}
        {rankCfg && rank && rank <= 3 && (
          <MedalBadge rank={rank as 1 | 2 | 3} />
        )}
      </div>

      {/* Score badge — top-right of whole card */}
      {scored && (
        <ScoreBadge
          score={scored.totalScore}
          eligible={scored.scoreBreakdown.eligible}
        />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        {/* Title + eligible tag */}
        <div>
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <h3 className="text-foreground line-clamp-1 text-base leading-tight font-extrabold">
              {project.title}
            </h3>
            {scored && !scored.scoreBreakdown.eligible && (
              <span className="shrink-0 rounded-xl bg-red-100 px-1.5 py-0.5 text-[10px] font-black text-red-600">
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

        {/* Meta info */}
        <div className="flex flex-col gap-y-1 py-1">
          {scored?.distanceKm != null && (
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

        {/* Bottom row: criteria chips + status badge */}
        <div className="mt-1 flex items-center justify-between gap-2">
          {scored ? (
            <CriteriaMiniScores scored={scored} weights={weights} />
          ) : (
            <span />
          )}
          {project.status && (
            <span
              className={cn(
                'shrink-0 rounded-xl border px-2 py-0.5 text-xs font-bold',
                getStatusStyle(project.status)
              )}
            >
              {project.status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
