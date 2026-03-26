import clsx from 'clsx';
import { Bolt, Play, RefreshCcw, RotateCw } from 'lucide-react';

import type { QuickAction as QuickActionType } from '@/lib/types';

import { SectionCard } from './section-card';

interface QuickActionsProps {
  actions: QuickActionType[];
}

function iconByLabel(label: string) {
  if (label.toLowerCase().includes('inbox')) return RefreshCcw;
  if (label.toLowerCase().includes('clean')) return Bolt;
  if (label.toLowerCase().includes('heartbeat')) return Play;
  return RotateCw;
}

function toneClass(tone: QuickActionType['tone']) {
  if (tone === 'primary') return 'border-blue-400/45 bg-blue-500/12 text-blue-100 hover:bg-blue-500/18';
  if (tone === 'danger') return 'border-rose-400/45 bg-rose-500/12 text-rose-200 hover:bg-rose-500/18';
  return 'border-slate-600/40 bg-slate-900/60 text-slate-100 hover:border-slate-500/60 hover:bg-slate-800/70';
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <SectionCard title="Quick Actions" subtitle="Fast controls for mission-critical operations">
      <div className="grid gap-2.5">
        {actions.map((action) => {
          const Icon = iconByLabel(action.label);

          return (
            <button
              key={action.id}
              type="button"
              className={clsx(
                'group rounded-xl border px-3.5 py-3.5 text-left text-sm transition',
                toneClass(action.tone)
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold tracking-[0.01em]">{action.label}</p>
                <Icon className="h-4 w-4 opacity-85 transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1.5 text-xs font-medium text-slate-300/90">{action.description}</p>
              <code className="mt-2.5 block truncate rounded border border-slate-500/35 bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-300">
                {action.command}
              </code>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
