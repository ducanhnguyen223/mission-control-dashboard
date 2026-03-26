import { Mail, ShieldAlert } from 'lucide-react';

import type { PriorityInboxItem } from '@/lib/types';
import { formatRelativeTime } from '@/lib/time';

import { Pill } from './pill';
import { SectionCard } from './section-card';

interface PriorityInboxProps {
  items: PriorityInboxItem[];
}

function priorityTone(priority: PriorityInboxItem['priority']) {
  if (priority === 'high') return 'high';
  if (priority === 'medium') return 'medium';
  return 'low';
}

export function PriorityInbox({ items }: PriorityInboxProps) {
  return (
    <SectionCard
      title="Priority Inbox"
      subtitle="Important mail across both accounts"
      rightSlot={<Pill tone="success">{items.length} tracked</Pill>}
    >
      <div className="space-y-2.5">
        {items.map((item) => (
          <article
            key={item.id}
            className="group rounded-xl border border-cyan-300/12 bg-[#101a2e]/70 p-3 transition hover:border-cyan-200/35"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{item.subject}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{item.sender}</p>
              </div>
              <Pill tone={priorityTone(item.priority)}>{item.priority}</Pill>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-cyan-200" />
                {item.account}
              </span>
              <span>•</span>
              <span className="uppercase">{item.tag}</span>
              <span>•</span>
              <span>{formatRelativeTime(item.receivedAt)}</span>
              {item.unread ? (
                <span className="font-display inline-flex items-center gap-1 rounded-full border border-cyan-300/40 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-100">
                  <ShieldAlert className="h-3 w-3" />
                  unread
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
