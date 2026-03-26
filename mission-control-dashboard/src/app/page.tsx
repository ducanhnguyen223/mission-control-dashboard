import { DashboardShell } from '@/components/dashboard/dashboard-shell';

interface HomePageProps {
  searchParams?: Promise<{ tab?: string | string[] }>;
}

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const tab = Array.isArray(params?.tab) ? params?.tab[0] : params?.tab;

  return <DashboardShell activeTab={tab} />;
}
