import { describe, expect, it } from 'vitest';

import { getDashboardSnapshot } from './dashboard-source';

describe('getDashboardSnapshot', () => {
  it('returns a full dashboard snapshot ready for the UI shell', async () => {
    const snapshot = await getDashboardSnapshot();

    expect(snapshot.priorityInbox.length).toBeGreaterThan(0);
    expect(snapshot.cleanupQueue.length).toBeGreaterThan(0);
    expect(snapshot.jobsSchool.length).toBeGreaterThan(0);
    expect(snapshot.tasksAgents.length).toBeGreaterThan(0);
    expect(snapshot.quickActions.length).toBe(4);
    expect(snapshot.openclawStatus.gateway).toBeDefined();
  });
});
