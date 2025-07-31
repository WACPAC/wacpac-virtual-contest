'use client';

import { useRouter } from 'next/navigation';
import { ContestListPage } from '../frontend/pages/ContestListPage';

export default function Home() {
  const router = useRouter();

  const handleNavigateToSettings = (contestId: string) => {
    router.push(`/${contestId}/settings`);
  };

  const handleNavigateToStandings = (contestId: string) => {
    router.push(`/${contestId}/standings`);
  };

  return (
    <ContestListPage
      onNavigateToManage={handleNavigateToSettings}
      onNavigateToStandings={handleNavigateToStandings}
    />
  );
}
