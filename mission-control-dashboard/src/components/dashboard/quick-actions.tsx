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
  if (tone === 'primary') return 'border-cyan-200/45 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/20';
  if (tone === 'danger') return 'border-rose-300/45 bg-rose-400/15 text-rose-100 hover:bg-rose-400/20';
  return 'border-cyan-300/20 bg-[#111b2f]/70 text-slate-100 hover:border-cyan-200/40';
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <SectionCard title="Quick Actions" subtitle="Fast controls for mission-critical operations">
      <div className="grid gap-2">
        {actions.map((action) => {
          const Icon = iconByLabel(action.label);

          return (
            <button
              key={action.id}
              type="button"
              className={clsx(
                'group rounded-xl border px-3 py-3 text-left text-sm transition',
                toneClass(action.tone)
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[11px] uppercase tracking-wide">{action.label}</p>
                <Icon className="h-4 w-4 opacity-85 transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 text-xs text-slate-300/90">{action.description}</p>
              <code className="mt-2 block truncate rounded border border-cyan-200/20 bg-[#071123]/85 px-2 py-1 text-[11px] text-slate-300">
                {action.command}
              </code>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
