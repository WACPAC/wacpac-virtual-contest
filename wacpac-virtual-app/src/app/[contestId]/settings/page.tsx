'use client';

import { useRouter } from 'next/navigation';
import { ContestManagePage } from '../../../frontend/pages/ContestManagePage';

interface SettingsPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const { contestId } = await params;

  const handleBackToList = () => {
    router.push('/');
  };

  return (
    <ContestManagePage
      contestId={contestId}
      onBackToList={handleBackToList}
    />
  );
} 