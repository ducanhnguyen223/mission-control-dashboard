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
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group rounded-xl border border-slate-600/35 bg-slate-900/60 p-3.5 transition hover:border-slate-500/55 hover:bg-slate-800/70"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{item.subject}</p>
                <p className="mt-1 truncate text-xs font-medium text-slate-400">{item.sender}</p>
              </div>
              <Pill tone={priorityTone(item.priority)}>{item.priority}</Pill>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-300" />
                {item.account}
              </span>
              <span>•</span>
              <span className="uppercase">{item.tag}</span>
              <span>•</span>
              <span>{formatRelativeTime(item.receivedAt)}</span>
              {item.unread ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/35 bg-blue-500/12 px-2 py-0.5 text-[10px] font-medium text-blue-200">
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
