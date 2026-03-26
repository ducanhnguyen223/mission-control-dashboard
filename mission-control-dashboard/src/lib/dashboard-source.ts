import { dashboardData } from '@/data/mock/dashboard-data';
import type { DashboardSnapshot } from '@/lib/types';

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  return dashboardData;
}
