import React, { useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete, Add, DragIndicator } from '@mui/icons-material';
import { useProblems } from '../../hooks/useProblems';

interface ProblemListProps {
  contestId: string;
}

export const ProblemList: React.FC<ProblemListProps> = ({ contestId }) => {
  const {
    problems,
    loading,
    error,
    createProblem,
    deleteProblem,
  } = useProblems(contestId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [problemUrl, setProblemUrl] = useState('');
  const [points, setPoints] = useState(100);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateProblem = async () => {
    if (!problemUrl.trim()) return;

    try {
      setIsCreating(true);
      setCreateError(null); // Clear any previous errors
      await createProblem({
        problemUrl: problemUrl.trim(),
        points,
      });
      setIsDialogOpen(false);
      setProblemUrl('');
      setPoints(100);
    } catch (error) {
      console.error('Failed to create problem:', error);
      setCreateError('問題の作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (window.confirm('この問題を削除してもよろしいですか？')) {
      try {
        await deleteProblem(problemId);
      } catch (error) {
        console.error('Failed to delete problem:', error);
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">問題一覧</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
          disabled={loading}
        >
          問題を追加
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {createError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setCreateError(null)}
        >
          {createError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : problems.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          まだ問題が追加されていません
        </Typography>
      ) : (
        <List>
          {problems.map((problem, index) => (
            <ListItem
              key={problem.id}
              divider
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', ":hover": { textDecoration: 'underline' } }} onClick={() => window.open(problem.problemUrl, '_blank')}>
                    <Chip 
                      label={String.fromCharCode(65 + index)} 
                      size="small" 
                      color="primary" 
                    />
                    <Typography variant="subtitle1">
                      {problem.name}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      得点: {problem.points}点
                    </Typography>
                    <Link
                      href={problem.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {problem.problemUrl}
                    </Link>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteProblem(problem.id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Create Problem Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>問題を追加</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="問題URL"
            fullWidth
            variant="outlined"
            value={problemUrl}
            onChange={(e) => setProblemUrl(e.target.value)}
            placeholder="https://atcoder.jp/contests/abc123/tasks/abc123_a"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="得点"
            type="number"
            fullWidth
            variant="outlined"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
            キャンセル
          </Button>
          <Button 
            onClick={handleCreateProblem} 
            variant="contained" 
            disabled={isCreating || !problemUrl.trim()}
          >
            {isCreating ? <CircularProgress size={20} /> : '追加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}; 