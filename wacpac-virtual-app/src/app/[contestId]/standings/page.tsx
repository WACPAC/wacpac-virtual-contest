'use client';

import { useRouter } from 'next/navigation';
import { StandingsPageComponent } from '../../../frontend/pages/StandingsPage';

interface StandingsPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const router = useRouter();
  const { contestId } = await params;

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