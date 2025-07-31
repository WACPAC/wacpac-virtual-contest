import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { ProblemList } from '../components/ContestManage/ProblemList';
import { UserList } from '../components/ContestManage/UserList';
import { useProblems } from '../hooks/useProblems';
import { useUsers } from '../hooks/useUsers';
import { contestAPI } from '../api/client';
import { Contest } from '../types';

interface ContestManagePageProps {
  contestId: string;
  onBackToList: () => void;
}

export const ContestManagePage: React.FC<ContestManagePageProps> = ({
  contestId,
  onBackToList,
}) => {
  const [contest, setContest] = useState<Contest | null>(null);
  const [contestLoading, setContestLoading] = useState(true);

  const {
    problems,
    loading: problemsLoading,
    error: problemsError,
  } = useProblems(contestId);

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers(contestId);

  // Fetch contest information
  useEffect(() => {
    const fetchContest = async () => {
      try {
        setContestLoading(true);
        const response = await contestAPI.getAll();
        const foundContest = response.data.find(c => c.id === contestId);
        setContest(foundContest || null);
      } catch (error) {
        console.error('Failed to fetch contest:', error);
      } finally {
        setContestLoading(false);
      }
    };

    if (contestId) {
      fetchContest();
    }
  }, [contestId]);

  const loading = problemsLoading || usersLoading || contestLoading;
  const error = problemsError || usersError;

  return (
    <Layout title="WACPAC Virtual Contest - コンテスト管理">
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={onBackToList}
            sx={{ textDecoration: 'underline' }}
          >
            コンテスト一覧
          </Link>
          <Typography color="text.primary">コンテスト管理</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBackToList}
            variant="outlined"
          >
            戻る
          </Button>
          <Typography variant="h4">
            {contest ? `${contest.name} - 管理` : 'コンテスト管理'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ProblemList contestId={contestId} />
          <UserList contestId={contestId} />
        </Box>
      )}
    </Layout>
  );
}; 