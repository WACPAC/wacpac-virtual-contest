'use client';

import { useRouter } from 'next/navigation';
import { ContestManagePage } from '../../../frontend/pages/ContestManagePage';
import { use } from 'react';

interface SettingsPageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const { contestId } = use(params);

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