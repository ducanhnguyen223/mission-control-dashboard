import { describe, expect, it } from 'vitest';

import { dashboardData } from '@/data/mock/dashboard-data';

describe('dashboardData', () => {
  it('contains all required mission control sections', () => {
    expect(dashboardData.priorityInbox.length).toBeGreaterThan(0);
    expect(dashboardData.cleanupQueue.length).toBeGreaterThan(0);
    expect(dashboardData.jobsSchool.length).toBeGreaterThan(0);
    expect(dashboardData.openclawStatus.sessionsActive).toBeGreaterThan(0);
    expect(dashboardData.tasksAgents.length).toBeGreaterThan(0);
    expect(dashboardData.quickActions.length).toBe(4);
  });

  it('keeps linkedin and school mail out of cleanup queue', () => {
    const protectedSendersInCleanup = dashboardData.cleanupQueue.filter((item) =>
      /(linkedin|classroom\.google\.com|recruit|interview)/i.test(`${item.sender} ${item.subject}`)
    );

    expect(protectedSendersInCleanup).toHaveLength(0);
  });

  it('includes high-priority FPT school/job context', () => {
    const importantFpt = dashboardData.priorityInbox.filter(
      (item) =>
        item.account === 'anhndgch220882@fpt.edu.vn' &&
        ['school', 'job alert', 'recruiter', 'interview'].includes(item.tag)
    );

    expect(importantFpt.length).toBeGreaterThan(0);
  });
});
