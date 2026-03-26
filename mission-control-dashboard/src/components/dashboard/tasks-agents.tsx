import { CheckCircle2, CircleDashed, CircleX } from 'lucide-react';

import type { AgentTaskItem } from '@/lib/types';
import { formatRelativeTime } from '@/lib/time';

import { Pill } from './pill';
import { SectionCard } from './section-card';

interface TasksAgentsProps {
  items: AgentTaskItem[];
}

function statusIcon(status: AgentTaskItem['status']) {
  if (status === 'running') return CircleDashed;
  if (status === 'completed') return CheckCircle2;
  return CircleX;
}

function statusTone(status: AgentTaskItem['status']) {
  if (status === 'running') return 'warning';
  if (status === 'completed') return 'success';
  return 'danger';
}

export function TasksAgents({ items }: TasksAgentsProps) {
  return (
    <SectionCard title="Tasks / Agents" subtitle="Current worker pipeline status">
      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = statusIcon(item.status);

          return (
            <article key={item.id} className="rounded-xl border border-cyan-300/12 bg-[#101a2e]/70 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{item.owner}</p>
                </div>
                <Pill tone={statusTone(item.status)}>{item.status}</Pill>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <Icon className="h-3.5 w-3.5 text-cyan-200" />
                <span>{item.duration}</span>
                <span>•</span>
                <span>{formatRelativeTime(item.updatedAt)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
