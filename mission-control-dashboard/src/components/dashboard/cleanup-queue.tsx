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
      <div className="space-y-2.5">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-cyan-300/10 bg-[#0f182a]/65 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">{item.subject}</p>
                <p className="truncate text-xs text-slate-400">{item.sender}</p>
              </div>
              <Pill tone="default">{Math.round(item.confidence * 100)}%</Pill>
            </div>
            <div className="font-display mt-2 text-[10px] uppercase tracking-wide text-slate-500">reason: {item.reason}</div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="font-display inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-300/25 bg-[#0b1427]/90 px-2.5 py-2 text-[10px] uppercase tracking-wide text-slate-300 transition hover:border-cyan-200/50 hover:text-cyan-100"
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
