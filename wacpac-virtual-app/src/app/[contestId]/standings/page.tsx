'use client';

import { useRouter } from 'next/navigation';
import { StandingsPageComponent } from '../../../frontend/pages/StandingsPage';
import { use } from 'react';

interface StandingsPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default function StandingsPage({ params }: StandingsPageProps) {
  const router = useRouter();
  const { contestId } = use(params);

  const handleBackToList = () => {
    router.push('/');
  };

  return (
    <StandingsPageComponent
      contestId={contestId}
      onBackToList={handleBackToList}
    />
  );
} 