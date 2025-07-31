import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { StandingsEntry, Problem } from '../../types';
import { formatSecondsToHMS } from '../../utils/timeUtils';

interface StandingsTableProps {
  standings: StandingsEntry[];
  problems: Problem[];
  contestStartTime?: Date; // コンテスト開始時刻
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings, problems, contestStartTime }) => {
  const getProblemLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, ...
  };

  const formatTime = (seconds: number) => {
    return formatSecondsToHMS(seconds);
  };

  const getProblemResult = (entry: StandingsEntry, problemId: string) => {
    return entry.problemResults.find(result => result.problemId === problemId);
  };

  const getACTimeFromStart = (acceptedAt: string, contestStart?: Date) => {
    if (!contestStart) return null;
    const acTime = new Date(acceptedAt);
    const seconds = Math.floor((acTime.getTime() - contestStart.getTime()) / 1000);
    return seconds >= 0 ? formatTime(seconds) : null;
  };

  const renderProblemCell = (entry: StandingsEntry, problem: Problem) => {
    const result = getProblemResult(entry, problem.id);
    
    if (!result || result.attempts === 0) {
      return <TableCell align="center">-</TableCell>;
    }

    if (result.score > 0) {
      // AC case
      return (
        <TableCell align="center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'success.main' }}>
              {result.score}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {result.acceptedAt && contestStartTime && (
                <Typography variant="caption" color="text.secondary">
                  {getACTimeFromStart(result.acceptedAt, contestStartTime)}
                </Typography>
              )}
              {result.penalty > 0 && (
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  +({result.penalty})
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>
      );
    } else {
      // Non-AC case
      return (
        <TableCell align="center">
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            ({result.attempts})
          </Typography>
        </TableCell>
      );
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: 60 }}>
              順位
            </TableCell>
            <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: 120 }}>
              ユーザー名
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: 80 }}>
              得点
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: 80 }}>
              時間
            </TableCell>
            {problems.map((problem, index) => (
              <TableCell 
                key={problem.id} 
                align="center" 
                sx={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: 80 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', '&:hover': {
                  textDecoration: 'underline',
                }}} onClick={() => {
                  window.open(problem.problemUrl, '_blank');
                }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '1.1rem' }}>
                    {getProblemLabel(index)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {problem.points}
                  </Typography>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((entry) => (
            <TableRow key={entry.user.id} hover>
              <TableCell align="center">
                <Chip
                  label={entry.rank} 
                  size="small" 
                  color={entry.rank <= 3 ? 'primary' : 'default'}
                  variant={entry.rank <= 3 ? 'filled' : 'outlined'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', color: entry.user.ratingColor }} onClick={() => {
                  window.open(`https://atcoder.jp/users/${entry.user.atcoderId}`, '_blank');
                }}>
                  {entry.user.atcoderId}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: entry.totalScore > 0 ? 'success.main' : 'gray' }}>
                    {entry.totalScore}
                  </Typography>
                  {entry.penalty > 0 && (
                    <Typography variant="caption" sx={{ color: 'error.main', fontSize: '0.7rem' }}>
                      ({entry.penalty})
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">
                  {formatTime(Math.floor((entry.totalTime + entry.penalty * 5 * 60 * 1000) / 1000))}
                </Typography>
              </TableCell>
              {problems.map((problem) => renderProblemCell(entry, problem))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 