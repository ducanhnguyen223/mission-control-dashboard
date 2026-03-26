import clsx from 'clsx';
import type { ReactNode } from 'react';

type PillTone = 'default' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'danger';

interface PillProps {
  children: ReactNode;
  tone?: PillTone;
}

const toneClassMap: Record<PillTone, string> = {
  default: 'border-slate-500/45 bg-slate-800/80 text-slate-200',
  high: 'border-rose-400/40 bg-rose-500/12 text-rose-200',
  medium: 'border-amber-400/40 bg-amber-500/12 text-amber-200',
  low: 'border-slate-400/35 bg-slate-700/45 text-slate-200',
  success: 'border-emerald-400/40 bg-emerald-500/12 text-emerald-200',
  warning: 'border-yellow-400/40 bg-yellow-500/12 text-yellow-200',
  danger: 'border-rose-400/40 bg-rose-500/12 text-rose-200'
};

export function Pill({ children, tone = 'default' }: PillProps) {
  return (
    <span
      className={clsx(
        'font-display inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]',
        toneClassMap[tone]
      )}
    >
      {children}
    </span>
  );
}
