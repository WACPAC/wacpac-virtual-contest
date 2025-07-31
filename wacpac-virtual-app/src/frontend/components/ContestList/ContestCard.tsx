import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Delete, Settings, Assessment, PlayArrow } from '@mui/icons-material';
import { Contest } from '../../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { contestAPI } from '../../api/client';
import { formatMinutesToJapanese } from '../../utils/timeUtils';

interface ContestCardProps {
  contest: Contest;
  onDelete: (id: string) => void;
  onManage: (id: string) => void;
  onViewStandings: (id: string) => void;
  onContestUpdate?: () => void;
}

export const ContestCard: React.FC<ContestCardProps> = ({
  contest,
  onDelete,
  onManage,
  onViewStandings,
  onContestUpdate,
}) => {
  const [isStarting, setIsStarting] = useState(false);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'before':
        return <Chip label="開始前" color="default" size="small" />;
      case 'running':
        return <Chip label="実行中" color="primary" size="small" />;
      case 'after':
        return <Chip label="終了" color="secondary" size="small" />;
      default:
        return <Chip label="不明" color="error" size="small" />;
    }
  };

  const formatDuration = (minutes: number) => {
    return formatMinutesToJapanese(minutes);
  };

  const handleStartContest = async () => {
    try {
      setIsStarting(true);
      await contestAPI.start(contest.id);
      onContestUpdate?.();
    } catch (error) {
      console.error('Failed to start contest:', error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 280 }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            {contest.name}
          </Typography>
          {getStatusChip(contest.status)}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            時間: {formatDuration(contest.durationMinutes)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            作成日: {format(new Date(contest.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
          </Typography>
          {contest.startTime && (
            <Typography variant="body2" color="text.secondary">
              開始日時: {format(new Date(contest.startTime), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
            </Typography>
          )}
        </Box>

        {contest.status === 'running' && contest.startTime && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
              コンテスト実行中
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {contest.status === 'before' && (
            <Button
              variant="contained"
              color="success"
              startIcon={isStarting ? <CircularProgress size={16} /> : <PlayArrow />}
              onClick={handleStartContest}
              disabled={isStarting}
              size="small"
            >
              開始
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => onManage(contest.id)}
            size="small"
          >
            管理
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => onViewStandings(contest.id)}
            size="small"
          >
            順位表
          </Button>
        </Box>
        <IconButton
          onClick={() => onDelete(contest.id)}
          color="error"
          size="small"
        >
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
}; 