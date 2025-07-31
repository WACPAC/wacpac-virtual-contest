import React, { useState } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { ContestCard } from '../components/ContestList/ContestCard';
import { useContests } from '../hooks/useContests';
import { TimeInput } from '../components/common/TimeInput';

interface ContestListPageProps {
  onNavigateToManage: (contestId: string) => void;
  onNavigateToStandings: (contestId: string) => void;
}

export const ContestListPage: React.FC<ContestListPageProps> = ({
  onNavigateToManage,
  onNavigateToStandings,
}) => {
  const { contests, loading, error, createContest, deleteContest } = useContests();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [contestName, setContestName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(100);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateContest = async () => {
    if (!contestName.trim()) {
      setCreateError('コンテスト名を入力してください');
      return;
    }

    if (durationMinutes <= 0) {
      setCreateError('コンテスト時間は1分以上である必要があります');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      await createContest({ name: contestName.trim(), durationMinutes });
      setIsCreateDialogOpen(false);
      setContestName('');
      setDurationMinutes(100);
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'コンテストの作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isCreating) {
      setIsCreateDialogOpen(false);
      setContestName('');
      setDurationMinutes(100);
      setCreateError(null);
    }
  };

  const handleDurationChange = (minutes: number | null) => {
    if (minutes !== null && minutes > 0) {
      setDurationMinutes(minutes);
    }
  };

  return (
    <Layout title="WACPAC Virtual Contest">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">コンテスト一覧</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          新しいコンテスト
        </Button>
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
        <Box>
          {contests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                まだコンテストがありません
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                「新しいコンテスト」ボタンから作成してください
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 3,
              }}
            >
              {contests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  onManage={() => onNavigateToManage(contest.id)}
                  onViewStandings={() => onNavigateToStandings(contest.id)}
                  onDelete={() => deleteContest(contest.id)}
                  onContestUpdate={() => window.location.reload()}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Create Contest Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>新しいコンテストを作成</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="コンテスト名"
            fullWidth
            variant="outlined"
            value={contestName}
            onChange={(e) => setContestName(e.target.value)}
            disabled={isCreating}
            sx={{ mb: 3 }}
          />
          <TimeInput
            label="コンテスト時間（分）"
            value={durationMinutes}
            onChange={handleDurationChange}
            disabled={isCreating}
            minMinutes={1}
            maxMinutes={12 * 60} // 最大12時間
            helperText="コンテストの開催時間を分数で入力してください"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isCreating}>
            キャンセル
          </Button>
          <Button 
            onClick={handleCreateContest} 
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? <CircularProgress size={20} /> : '作成'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}; 