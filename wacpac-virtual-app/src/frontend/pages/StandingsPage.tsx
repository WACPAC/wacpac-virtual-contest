import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
} from '@mui/material';
import { ArrowBack, Refresh, Download, Schedule } from '@mui/icons-material';
import { Layout } from '../components/Layout/Layout';
import { StandingsTable } from '../components/Standings/StandingsTable';
import { useStandings } from '../hooks/useStandings';
import { useProblems } from '../hooks/useProblems';
import { getStatusChip, getStatusLabel, getStatusColor } from '../utils/contestUtils';

interface StandingsPageComponentProps {
  contestId: string;
  onBackToList: () => void;
}

export const StandingsPageComponent: React.FC<StandingsPageComponentProps> = ({
  contestId,
  onBackToList,
}) => {
  const {
    standings,
    firstACMap,
    contest,
    loading: StandingsLoading,
    updating,
    error: StandingsError,
    updateStandings,
    exportToCSV,
  } = useStandings(contestId);

  const {
    problems,
    loading: problemsLoading,
    error: problemsError,
  } = useProblems(contestId);

  const loading = StandingsLoading || problemsLoading;
  const error = StandingsError || problemsError;

  const contestName = contest?.name;

  const handleUpdate = async () => {
    if (contest?.status === 'after') {
      const confirm = window.confirm('コンテストが終了していますが、本当に更新しますか？');
      if (!confirm) return;
    }
    try {
      await updateStandings();
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleExport = async () => {
    try {
      await exportToCSV();
    } catch {
      // Error handling is done in the hook
    }
  };

  const getAutoUpdateMessage = () => {
    if (!contest) return null;
    
    switch (contest.status) {
      case 'before':
        return 'コンテスト開始前のため自動更新は無効です';
      case 'running':
        return '3分毎に自動更新';
      case 'after':
        return 'コンテスト終了後のため、自動更新は停止されています';
      default:
        return null;
    }
  };

  const [remainTime, setRemainTime] = useState<string | undefined>(undefined);
  const [timeLabel, setTimeLabel] = useState<string>('残り時間');
  
  useEffect(() => {
    if (!contest?.startTime) return;

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const startTime = new Date(contest.startTime!).getTime();
      const endTime = startTime + contest.durationMinutes * 60 * 1000;

      let targetTime: number;
      let label: string;

      if (currentTime < startTime) {
        // コンテスト開始前：開始までの時間を表示
        targetTime = startTime;
        label = '開始まで';
      } else if (currentTime < endTime) {
        // コンテスト実行中：終了までの時間を表示
        targetTime = endTime;
        label = '残り時間';
      } else {
        // コンテスト終了後
        setRemainTime(undefined);
        setTimeLabel('残り時間');
        return;
      }

      const timeDiff = Math.max(0, targetTime - currentTime);
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setRemainTime(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      setTimeLabel(label);
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  return (
    <Layout title="WACPAC Virtual Contest - 順位表">
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
          <Typography color="text.primary">順位表</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBackToList}
            variant="outlined"
          >
            戻る
          </Button>
          <Typography variant="h4">
            {`${contestName} - 順位表`}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'space-between' }}>
            {contest && getStatusChip(contest.status, contest.startTime)}
            {contest && contest.status === 'running' && remainTime && (
              <Chip
                label={`${timeLabel} ${remainTime}`}
                sx={{ fontSize: '1.1rem' }}
              />
            )}
          </Box>
        </Box>

        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<Schedule />}
                label={getAutoUpdateMessage()}
                size="small"
                variant="outlined"
                color={contest?.status === 'running' ? 'primary' : 'default'}
              />
              {updating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    更新中...
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<Refresh />}
                onClick={handleUpdate}
                disabled={updating}
                variant="outlined"
              >
                手動更新
              </Button>
              <Button
                startIcon={<Download />}
                onClick={handleExport}
                disabled={loading || standings.length === 0}
                variant="contained"
              >
                CSV出力
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!loading && (
        <>
          {standings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                まだ順位データがありません
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                問題とユーザーを追加してから「手動更新」をクリックしてください
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                参加者数: {standings.length}人 | 問題数: {problems.length}問
              </Typography>
              <StandingsTable 
                standings={standings} 
                problems={problems} 
                contestStartTime={contest?.startTime ? new Date(contest.startTime) : undefined}
                firstACMap={firstACMap}
              />
            </Box>
          )}
        </>
      )}
    </Layout>
  );
}; 