import { describe, expect, it } from 'vitest';

import { formatRelativeTime } from '@/lib/time';

describe('formatRelativeTime', () => {
  it('formats minute-level recency', () => {
    expect(formatRelativeTime('2026-03-25T08:10:00.000Z', new Date('2026-03-25T08:25:00.000Z'))).toBe('15m ago');
  });

  it('formats hour-level recency', () => {
    expect(formatRelativeTime('2026-03-25T05:25:00.000Z', new Date('2026-03-25T08:25:00.000Z'))).toBe('3h ago');
  });

  it('formats day-level recency', () => {
    expect(formatRelativeTime('2026-03-22T08:25:00.000Z', new Date('2026-03-25T08:25:00.000Z'))).toBe('3d ago');
  });
});
