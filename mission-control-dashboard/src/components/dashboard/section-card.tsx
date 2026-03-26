import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, rightSlot, children }: SectionCardProps) {
  return (
    <section className="relative rounded-2xl border border-slate-600/35 bg-slate-900/65 p-5 shadow-[0_10px_36px_rgba(2,6,23,0.33)] backdrop-blur-sm sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold leading-tight text-slate-100">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </header>

      <div>{children}</div>
    </section>
  );
}
