import { Activity, AlertTriangle, Gauge, ShieldCheck } from 'lucide-react';

import type { OpenClawStatus as OpenClawStatusType } from '@/lib/types';
import { formatRelativeTime } from '@/lib/time';

import { Pill } from './pill';
import { SectionCard } from './section-card';

interface OpenClawStatusProps {
  status: OpenClawStatusType;
}

function statusTone(value: OpenClawStatusType['gateway'] | OpenClawStatusType['heartbeat']) {
  if (value === 'online' || value === 'healthy') return 'success';
  if (value === 'degraded' || value === 'warning') return 'warning';
  return 'danger';
}

export function OpenClawStatus({ status }: OpenClawStatusProps) {
  return (
    <SectionCard
      title="OpenClaw Status"
      subtitle="Runtime health and gateway telemetry"
      rightSlot={<Pill tone={statusTone(status.gateway)}>{status.gateway}</Pill>}
    >
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-slate-600/35 bg-slate-900/60 p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Gateway</p>
          <p className="mt-2 inline-flex items-center gap-2 font-semibold text-slate-100">
            <Gauge className="h-4 w-4 text-slate-300" />
            {status.gateway}
          </p>
        </div>
        <div className="rounded-xl border border-slate-600/35 bg-slate-900/60 p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Heartbeat</p>
          <p className="mt-2 inline-flex items-center gap-2 font-semibold text-slate-100">
            <Activity className="h-4 w-4 text-emerald-300" />
            {status.heartbeat}
          </p>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl border border-slate-600/35 bg-slate-900/60 p-3.5">
        <p className="text-[11px] font-medium text-slate-500">Last important alert</p>
        <p className="mt-2.5 inline-flex items-center gap-2 text-sm font-medium text-slate-100">
          {status.lastAlert.toLowerCase().includes('no critical') ? (
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-300" />
          )}
          {status.lastAlert}
        </p>
      </div>

      <div className="mt-3.5 flex items-center justify-between rounded-xl border border-slate-600/35 bg-slate-900/55 px-3.5 py-2.5 text-xs font-medium text-slate-400">
        <span>Sessions active: {status.sessionsActive}</span>
        <span>Updated {formatRelativeTime(status.lastSyncAt)}</span>
      </div>
    </SectionCard>
  );
}
