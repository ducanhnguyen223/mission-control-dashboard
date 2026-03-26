import { Archive, Inbox, ShieldCheck, Trash2 } from 'lucide-react';

import type { CleanupQueueItem } from '@/lib/types';

import { Pill } from './pill';
import { SectionCard } from './section-card';

interface CleanupQueueProps {
  items: CleanupQueueItem[];
}

const actions = [
  { label: 'Archive all', icon: Archive },
  { label: 'Trash all', icon: Trash2 },
  { label: 'Unsubscribe', icon: Inbox },
  { label: 'Keep sender', icon: ShieldCheck }
];

export function CleanupQueue({ items }: CleanupQueueProps) {
  return (
    <SectionCard
      title="Cleanup Queue"
      subtitle="Promo/newsletter candidates only"
      rightSlot={<Pill tone="warning">{items.length} candidates</Pill>}
    >
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-600/35 bg-slate-900/60 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{item.subject}</p>
                <p className="truncate text-xs font-medium text-slate-400">{item.sender}</p>
              </div>
              <Pill tone="default">{Math.round(item.confidence * 100)}%</Pill>
            </div>
            <div className="mt-2 text-[11px] font-medium text-slate-500">Reason: {item.reason}</div>
          </article>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-500/40 bg-slate-900/75 px-3 py-2 text-[11px] font-medium text-slate-200 transition hover:border-slate-400/65 hover:bg-slate-800/75"
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
