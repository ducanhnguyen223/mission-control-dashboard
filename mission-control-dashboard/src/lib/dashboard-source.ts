import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { dashboardData } from '@/data/mock/dashboard-data';
import { buildCleanupQueue } from '@/lib/mail-guard';
import type { AgentTaskItem, DashboardSnapshot, OpenClawStatus } from '@/lib/types';

const MEMORY_DIR = process.env.OPENCLAW_MEMORY_DIR ?? '/root/.openclaw/workspace/memory';
const INBOUND_DIR = process.env.OPENCLAW_INBOUND_DIR ?? '/root/.openclaw/media/inbound';

const WATCHDOG_LOG = `${MEMORY_DIR}/claude-watchdog.log`;
const CONTROLLER_V2_LOG = `${MEMORY_DIR}/claude-controller-v2.log`;
const CONTROLLER_V3_LOG = `${MEMORY_DIR}/claude-controller-v3.log`;

const WATCHDOG_STATE = `${MEMORY_DIR}/claude-watchdog.state`;
const CONTROLLER_V2_STATE = `${MEMORY_DIR}/claude-controller-v2.state`;
const CONTROLLER_V3_STATE = `${MEMORY_DIR}/claude-controller-v3.state`;

const MAIN_SESSIONS_PATH = process.env.OPENCLAW_MAIN_SESSIONS_PATH ?? '/root/.openclaw/agents/main/sessions/sessions.json';
const CLAUDE_SESSIONS_PATH =
  process.env.OPENCLAW_CLAUDE_SESSIONS_PATH ?? '/root/.openclaw/agents/claude-code/sessions/sessions.json';

type RuntimeStatus = 'running' | 'completed' | 'failed';

interface RuntimeTask {
  id: string;
  name: string;
  owner: string;
  status: RuntimeStatus;
  updatedAt: string;
  duration: string;
}

interface RuntimeMailEvent {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
}

interface RuntimeSnapshot {
  openclawStatus?: OpenClawStatus;
  tasksAgents: AgentTaskItem[];
  runtimeMail: RuntimeMailEvent[];
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const runtime = await readRuntimeSnapshot();

  const runtimeMail = runtime.runtimeMail.map((item) => ({
    id: `runtime-mail-${item.id}`,
    account: 'runtime@openclaw.local',
    sender: item.sender,
    subject: item.subject,
    receivedAt: item.receivedAt,
    tag: classifyRuntimeMailTag(item.sender, item.subject),
    priority: classifyRuntimePriority(item.sender, item.subject),
    unread: true
  }));

  const mergedPriorityInbox = dedupePriorityInbox([...runtimeMail, ...dashboardData.priorityInbox]);

  return {
    priorityInbox: mergedPriorityInbox,
    cleanupQueue: buildCleanupQueue(mergedPriorityInbox),
    jobsSchool: dashboardData.jobsSchool,
    openclawStatus: runtime.openclawStatus ?? dashboardData.openclawStatus,
    tasksAgents: runtime.tasksAgents.length > 0 ? runtime.tasksAgents : dashboardData.tasksAgents,
    quickActions: dashboardData.quickActions
  };
}

async function readRuntimeSnapshot(): Promise<RuntimeSnapshot> {
  const [
    watchdogLog,
    controllerV2Log,
    controllerV3Log,
    watchdogState,
    controllerV2State,
    controllerV3State,
    mainSessions,
    claudeSessions,
    runtimeMail
  ] = await Promise.all([
    readTextFile(WATCHDOG_LOG),
    readTextFile(CONTROLLER_V2_LOG),
    readTextFile(CONTROLLER_V3_LOG),
    readTextFile(WATCHDOG_STATE),
    readTextFile(CONTROLLER_V2_STATE),
    readTextFile(CONTROLLER_V3_STATE),
    readTextFile(MAIN_SESSIONS_PATH),
    readTextFile(CLAUDE_SESSIONS_PATH),
    readInboundMailEvents()
  ]);

  const mainSessionCount = countSessions(mainSessions);
  const claudeSessionCount = countSessions(claudeSessions);
  const totalSessionCount = mainSessionCount + claudeSessionCount;

  const tasks: RuntimeTask[] = [
    ...extractWatchdogTasks(watchdogLog),
    ...extractControllerV2Tasks(controllerV2Log),
    ...extractControllerV3Tasks(controllerV3Log),
    ...extractSessionTasks(mainSessionCount, claudeSessionCount)
  ];

  return {
    openclawStatus: deriveOpenClawStatus({
      watchdogLog,
      controllerV2Log,
      controllerV3Log,
      watchdogState,
      controllerV2State,
      controllerV3State,
      totalSessionCount
    }),
    tasksAgents: dedupeAgentTasks(tasks).slice(0, 6),
    runtimeMail
  };
}

function extractWatchdogTasks(log: string): RuntimeTask[] {
  const lines = log.split('\n').filter(Boolean);
  const latest = lines.slice(-120);

  const startCount = latest.filter((line) => line.includes('watchdog-start')).length;
  const attentionCount = latest.filter((line) => line.includes('attention-needed')).length;

  if (startCount === 0 && attentionCount === 0) {
    return [];
  }

  const lastIso = extractLatestIso(latest) ?? new Date().toISOString();
  const latestAttentionAt = extractLatestIso(latest.filter((line) => line.includes('attention-needed')));
  const latestStartAt = extractLatestIso(latest.filter((line) => line.includes('watchdog-start')));

  return [
    {
      id: 'rt-watchdog',
      name: 'Watchdog prompt monitor',
      owner: 'openclaw-watchdog',
      status: latestAttentionAt && (!latestStartAt || latestAttentionAt > latestStartAt) ? 'running' : 'completed',
      updatedAt: lastIso,
      duration: `${startCount} checks`
    }
  ];
}

function extractControllerV2Tasks(log: string): RuntimeTask[] {
  const lines = log.split('\n').filter(Boolean);
  const latest = lines.slice(-200);

  const startCount = latest.filter((line) => line.includes('controller-start')).length;
  const pauseCount = latest.filter((line) => line.includes('pause external-or-destructive')).length;
  const yesActions = latest.filter((line) => line.includes('action submit:yes') || line.includes('action submit:1')).length;

  if (startCount === 0 && pauseCount === 0 && yesActions === 0) {
    return [];
  }

  const lastIso = extractLatestIso(latest) ?? new Date().toISOString();
  const latestPauseAt = extractLatestIso(latest.filter((line) => line.includes('pause external-or-destructive')));
  const latestApproveAt = extractLatestIso(
    latest.filter((line) => line.includes('action submit:yes') || line.includes('action submit:1'))
  );
  const status: RuntimeStatus =
    latestPauseAt && (!latestApproveAt || latestPauseAt > latestApproveAt) ? 'running' : 'completed';

  return [
    {
      id: 'rt-controller-v2',
      name: 'Controller v2 approval loop',
      owner: 'openclaw-controller-v2',
      status,
      updatedAt: lastIso,
      duration: `${yesActions} approvals`
    }
  ];
}

function extractControllerV3Tasks(log: string): RuntimeTask[] {
  const lines = log.split('\n').filter(Boolean);
  const latest = lines.slice(-120);

  const startCount = latest.filter((line) => line.includes('controller-v3-start')).length;
  const stopCount = latest.filter((line) => line.includes('controller-v3-stop')).length;
  const keyboardInterrupts = latest.filter((line) => line.includes('keyboard-interrupt')).length;

  if (startCount === 0 && stopCount === 0) {
    return [];
  }

  const lastIso = extractLatestIso(latest) ?? new Date().toISOString();

  let status: RuntimeStatus = 'running';
  if (keyboardInterrupts > 0 && stopCount >= startCount) {
    status = 'failed';
  } else if (stopCount > 0 && stopCount >= startCount) {
    status = 'completed';
  }

  return [
    {
      id: 'rt-controller-v3',
      name: 'Controller v3 foreground run',
      owner: 'openclaw-controller-v3',
      status,
      updatedAt: lastIso,
      duration: `${startCount} starts`
    }
  ];
}

function extractSessionTasks(mainSessionCount: number, claudeSessionCount: number): RuntimeTask[] {
  const totalSessionCount = mainSessionCount + claudeSessionCount;

  if (totalSessionCount === 0) {
    return [];
  }

  return [
    {
      id: 'rt-sessions',
      name: 'OpenClaw session registry',
      owner: 'openclaw-session-store',
      status: 'running',
      updatedAt: new Date().toISOString(),
      duration: `${totalSessionCount} active (${mainSessionCount} main / ${claudeSessionCount} claude)`
    }
  ];
}

function deriveOpenClawStatus(input: {
  watchdogLog: string;
  controllerV2Log: string;
  controllerV3Log: string;
  watchdogState: string;
  controllerV2State: string;
  controllerV3State: string;
  totalSessionCount: number;
}): OpenClawStatus | undefined {
  const hasAnySignals =
    input.watchdogLog.length > 0 ||
    input.controllerV2Log.length > 0 ||
    input.controllerV3Log.length > 0 ||
    input.watchdogState.length > 0 ||
    input.controllerV2State.length > 0 ||
    input.controllerV3State.length > 0;

  if (!hasAnySignals) {
    return undefined;
  }

  const allLines = [...input.watchdogLog.split('\n'), ...input.controllerV2Log.split('\n'), ...input.controllerV3Log.split('\n')]
    .filter(Boolean)
    .slice(-300);

  const lastSyncAt = extractLatestIso(allLines) ?? new Date().toISOString();

  const latestPauseAt = extractLatestIso(allLines.filter((line) => line.includes('pause external-or-destructive')));
  const latestApproveAt = extractLatestIso(
    allLines.filter((line) => line.includes('action submit:yes') || line.includes('action submit:1'))
  );
  const latestAttentionAt = extractLatestIso(allLines.filter((line) => line.includes('attention-needed')));
  const latestWatchdogStartAt = extractLatestIso(allLines.filter((line) => line.includes('watchdog-start')));
  const latestFailureAt = extractLatestIso(allLines.filter((line) => line.includes('keyboard-interrupt')));
  const latestControllerStartAt = extractLatestIso(
    allLines.filter((line) => line.includes('controller-start') || line.includes('controller-v3-start'))
  );

  const hasUnresolvedPause = latestPauseAt && (!latestApproveAt || latestPauseAt > latestApproveAt);
  const hasPendingAttention = latestAttentionAt && (!latestWatchdogStartAt || latestAttentionAt > latestWatchdogStartAt);
  const hasRecentFailure = latestFailureAt && (!latestControllerStartAt || latestFailureAt > latestControllerStartAt);

  const gateway: OpenClawStatus['gateway'] =
    hasRecentFailure || hasUnresolvedPause || hasPendingAttention ? 'degraded' : 'online';

  const heartbeat: OpenClawStatus['heartbeat'] = hasRecentFailure ? 'critical' : hasPendingAttention ? 'warning' : 'healthy';

  const lastAlert = hasUnresolvedPause
    ? 'External/destructive prompt paused for OpenClaw control'
    : hasRecentFailure
      ? 'Controller interrupted in latest runtime run'
      : hasPendingAttention
        ? 'Watchdog is waiting for pending confirmation'
        : 'No critical alerts in latest runtime logs';

  return {
    gateway,
    heartbeat,
    lastAlert,
    sessionsActive: input.totalSessionCount,
    lastSyncAt
  };
}

async function readInboundMailEvents(): Promise<RuntimeMailEvent[]> {
  try {
    const entries = await readdir(INBOUND_DIR, { withFileTypes: true });
    const jsonNames = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 40);

    const enriched = await Promise.all(
      jsonNames.map(async (name) => {
        const filePath = join(INBOUND_DIR, name);
        const fileStat = await stat(filePath);
        const parsed = parseInboundFilename(name);

        return {
          id: name,
          sender: parsed.sender,
          subject: parsed.subject,
          receivedAt: fileStat.mtime.toISOString()
        };
      })
    );

    return enriched.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 6);
  } catch (error: unknown) {
    console.error('[dashboard-source] Failed to read inbound mail events', {
      path: INBOUND_DIR,
      error: error instanceof Error ? error.message : String(error)
    });

    return [];
  }
}

function parseInboundFilename(fileName: string): { sender: string; subject: string } {
  const match = fileName.match(/^codex-[^-]+-(.+?)---/);

  if (!match) {
    return {
      sender: 'inbound@openclaw.local',
      subject: 'Inbound account snapshot'
    };
  }

  const payload = match[1] ?? '';
  const parts = payload.split('-').filter(Boolean);

  if (parts.length === 0) {
    return {
      sender: 'inbound@openclaw.local',
      subject: 'Inbound account snapshot'
    };
  }

  const plan = parts.length > 1 ? parts[parts.length - 1] : undefined;
  const senderToken = parts.length > 1 ? parts.slice(0, -1).join('-') : parts[0];
  const sender = decodeSenderToken(senderToken);

  return {
    sender,
    subject: plan ? `Inbound account snapshot (${plan})` : 'Inbound account snapshot'
  };
}

function decodeSenderToken(token: string): string {
  if (!token) {
    return 'inbound@openclaw.local';
  }

  const normalized = token.replace(/_/g, '@');
  const atIndex = normalized.indexOf('@');

  if (atIndex < 0) {
    return `${maskToken(normalized)}@openclaw.local`;
  }

  const localPart = normalized.slice(0, atIndex);
  const domainPart = normalized.slice(atIndex + 1);

  return `${maskToken(localPart)}@${domainPart}`;
}

function maskToken(value: string): string {
  if (!value) {
    return 'x*';
  }

  if (value.length <= 2) {
    return `${value[0] ?? 'x'}*`;
  }

  return `${value[0]}${'*'.repeat(Math.min(4, value.length - 1))}`;
}

function classifyRuntimeMailTag(sender: string, subject: string) {
  const lower = `${sender} ${subject}`.toLowerCase();
  if (lower.includes('security')) return 'security' as const;
  if (lower.includes('interview')) return 'interview' as const;
  if (lower.includes('recruit')) return 'recruiter' as const;
  if (lower.includes('job')) return 'job alert' as const;
  if (lower.includes('school') || lower.includes('fpt')) return 'school' as const;
  if (lower.includes('promotion') || lower.includes('promo')) return 'promotion' as const;
  if (lower.includes('newsletter') || lower.includes('digest')) return 'newsletter' as const;
  return 'account' as const;
}

function classifyRuntimePriority(sender: string, subject: string): 'high' | 'medium' | 'low' {
  const lower = `${sender} ${subject}`.toLowerCase();

  if (lower.includes('security') || lower.includes('interview') || lower.includes('recruit')) {
    return 'high';
  }

  if (lower.includes('job') || lower.includes('school') || lower.includes('heartbeat')) {
    return 'medium';
  }

  return 'low';
}

function dedupePriorityInbox(items: DashboardSnapshot['priorityInbox']): DashboardSnapshot['priorityInbox'] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.id}|${item.account}|${item.sender}|${item.subject}|${item.receivedAt}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function dedupeAgentTasks(tasks: RuntimeTask[]): AgentTaskItem[] {
  const map = new Map<string, AgentTaskItem>();

  for (const task of tasks) {
    map.set(task.id, {
      id: task.id,
      name: task.name,
      owner: task.owner,
      status: task.status,
      updatedAt: task.updatedAt,
      duration: task.duration
    });
  }

  return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function countSessions(raw: string): number {
  if (!raw.trim()) {
    return 0;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (!parsed || typeof parsed !== 'object') {
      return 0;
    }

    return Object.keys(parsed).length;
  } catch (error: unknown) {
    console.error('[dashboard-source] Failed to parse sessions JSON', {
      error: error instanceof Error ? error.message : String(error)
    });

    return 0;
  }
}

function extractLatestIso(lines: string[]): string | undefined {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index] ?? '';
    const match = line.match(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})Z\]/);

    if (match) {
      return `${match[1]}.000Z`;
    }
  }

  return undefined;
}

async function readTextFile(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch (error: unknown) {
    console.error('[dashboard-source] Failed to read file', {
      path,
      error: error instanceof Error ? error.message : String(error)
    });

    return '';
  }
}
