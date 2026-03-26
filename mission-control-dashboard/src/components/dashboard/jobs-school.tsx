import { BriefcaseBusiness, GraduationCap } from 'lucide-react';

import type { JobSchoolItem } from '@/lib/types';
import { formatRelativeTime } from '@/lib/time';

import { Pill } from './pill';
import { SectionCard } from './section-card';

interface JobsSchoolProps {
  items: JobSchoolItem[];
}

function typeIcon(type: JobSchoolItem['type']) {
  if (type === 'school') {
    return GraduationCap;
  }

  return BriefcaseBusiness;
}

function typeTone(type: JobSchoolItem['type']) {
  if (type === 'interview' || type === 'recruiter') {
    return 'high' as const;
  }

  if (type === 'school') {
    return 'warning' as const;
  }

  return 'default' as const;
}

export function JobsSchool({ items }: JobsSchoolProps) {
  return (
    <SectionCard
      title="Jobs / School"
      subtitle="Prioritized from FPT mailbox"
      rightSlot={<Pill tone="success">FPT protected</Pill>}
    >
      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = typeIcon(item.type);

          return (
            <article key={item.id} className="rounded-xl border border-cyan-300/12 bg-[#101a2d]/68 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.source}</p>
                </div>
                <Pill tone={typeTone(item.type)}>{item.type}</Pill>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Icon className="h-3.5 w-3.5 text-cyan-200" />
                <span className="truncate">{item.account}</span>
                <span>•</span>
                <span>{formatRelativeTime(item.receivedAt)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
