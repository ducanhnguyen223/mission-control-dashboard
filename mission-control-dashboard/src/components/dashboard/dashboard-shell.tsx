import type { ComponentType } from 'react';

import clsx from 'clsx';
import { ActivitySquare, Bell, Cpu, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

import { getDashboardSnapshot } from '@/lib/dashboard-source';

import { CleanupQueue } from './cleanup-queue';
import { JobsSchool } from './jobs-school';
import { OpenClawStatus } from './openclaw-status';
import { PriorityInbox } from './priority-inbox';
import { QuickActions } from './quick-actions';
import { TasksAgents } from './tasks-agents';

type DashboardTabId = 'overview' | 'mail' | 'agents' | 'infra' | 'jobs-school' | 'actions';

interface DashboardTab {
  id: DashboardTabId;
  label: string;
}

const DASHBOARD_TABS: DashboardTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'mail', label: 'Mail' },
  { id: 'agents', label: 'Agents' },
  { id: 'infra', label: 'Infra' },
  { id: 'jobs-school', label: 'Jobs/School' },
  { id: 'actions', label: 'Actions' }
];

interface DashboardShellProps {
  activeTab?: string;
}

export async function DashboardShell({ activeTab }: DashboardShellProps) {
  const dashboardData = await getDashboardSnapshot();
  const normalizedTab = normalizeTab(activeTab);

  const criticalCount = dashboardData.priorityInbox.filter((item) => item.priority === 'high').length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-5 pb-12 pt-8 sm:px-7 lg:px-10 lg:pt-10">
      <header className="mb-7 rounded-3xl border border-slate-600/35 bg-slate-900/70 p-6 shadow-[0_16px_44px_rgba(2,6,23,0.34)] backdrop-blur-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-medium text-slate-300">Mission Control · OpenClaw</p>
            <h1 className="font-display mt-2 text-3xl font-semibold leading-tight text-slate-100 md:text-[2.15rem]">
              Operator Dashboard v1
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Local-first cockpit for Gmail triage, OpenClaw runtime visibility, and high-priority action flows.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-400/35 bg-blue-500/12 px-3 py-1.5 text-xs font-medium text-blue-200">
              <Zap className="h-3.5 w-3.5" />
              Mission state stable · {criticalCount} high-priority inbox events
            </div>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 gap-2.5 text-xs sm:min-w-[300px]">
            <MetricChip icon={Shield} label="Priority items" value={`${dashboardData.priorityInbox.length}`} />
            <MetricChip icon={Bell} label="Cleanup queue" value={`${dashboardData.cleanupQueue.length}`} />
            <MetricChip icon={Cpu} label="Active sessions" value={`${dashboardData.openclawStatus.sessionsActive}`} />
            <MetricChip icon={ActivitySquare} label="Tasks tracked" value={`${dashboardData.tasksAgents.length}`} />
          </div>
        </div>
      </header>

      <nav className="mb-5 overflow-x-auto pb-1">
        <ul className="inline-flex min-w-full gap-2 rounded-2xl border border-slate-600/30 bg-slate-900/55 p-1.5">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = tab.id === normalizedTab;

            return (
              <li key={tab.id}>
                <Link
                  href={tab.id === 'overview' ? '/' : `/?tab=${tab.id}`}
                  className={clsx(
                    'inline-flex h-9 items-center rounded-xl px-3.5 text-xs font-semibold transition',
                    isActive
                      ? 'bg-slate-100 text-slate-950 shadow-[0_6px_22px_rgba(15,23,42,0.34)]'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {normalizedTab === 'overview' ? (
        <>
          <section className="grid gap-5 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <PriorityInbox items={dashboardData.priorityInbox} />
              <CleanupQueue items={dashboardData.cleanupQueue} />
            </div>

            <div className="space-y-5 lg:col-span-5">
              <JobsSchool items={dashboardData.jobsSchool} />
              <OpenClawStatus status={dashboardData.openclawStatus} />
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <TasksAgents items={dashboardData.tasksAgents} />
            </div>
            <div className="lg:col-span-5">
              <QuickActions actions={dashboardData.quickActions} />
            </div>
          </section>
        </>
      ) : null}

      {normalizedTab === 'mail' ? (
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <PriorityInbox items={dashboardData.priorityInbox} />
          </div>
          <div className="space-y-5 lg:col-span-5">
            <CleanupQueue items={dashboardData.cleanupQueue} />
          </div>
        </section>
      ) : null}

      {normalizedTab === 'agents' ? (
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TasksAgents items={dashboardData.tasksAgents} />
          </div>
          <div className="lg:col-span-5">
            <QuickActions actions={dashboardData.quickActions.filter((action) => !isDestructiveInfraAction(action.command))} />
          </div>
        </section>
      ) : null}

      {normalizedTab === 'infra' ? (
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <OpenClawStatus status={dashboardData.openclawStatus} />
          </div>
          <div className="lg:col-span-5">
            <QuickActions actions={dashboardData.quickActions.filter((action) => isDestructiveInfraAction(action.command))} />
          </div>
        </section>
      ) : null}

      {normalizedTab === 'jobs-school' ? (
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <JobsSchool items={dashboardData.jobsSchool} />
          </div>
          <div className="lg:col-span-5">
            <PriorityInbox
              items={dashboardData.priorityInbox.filter((item) => item.account.endsWith('@fpt.edu.vn'))}
            />
          </div>
        </section>
      ) : null}

      {normalizedTab === 'actions' ? (
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <QuickActions actions={dashboardData.quickActions} />
          </div>
          <div className="lg:col-span-5">
            <OpenClawStatus status={dashboardData.openclawStatus} />
          </div>
        </section>
      ) : null}
    </main>
  );
}

function normalizeTab(activeTab?: string): DashboardTabId {
  if (activeTab === 'mail') return 'mail';
  if (activeTab === 'agents') return 'agents';
  if (activeTab === 'infra') return 'infra';
  if (activeTab === 'jobs-school') return 'jobs-school';
  if (activeTab === 'actions') return 'actions';

  return 'overview';
}

function isDestructiveInfraAction(command: string): boolean {
  return command.includes('heartbeat') || command.includes('restart');
}

interface MetricChipProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function MetricChip({ icon: Icon, label, value }: MetricChipProps) {
  return (
    <div className="rounded-xl border border-slate-600/35 bg-slate-900/65 px-3.5 py-3 shadow-[0_6px_20px_rgba(2,6,23,0.28)]">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5 text-slate-300" />
        {label}
      </p>
      <p className="mt-1.5 text-base font-semibold leading-none text-slate-100">{value}</p>
    </div>
  );
}
