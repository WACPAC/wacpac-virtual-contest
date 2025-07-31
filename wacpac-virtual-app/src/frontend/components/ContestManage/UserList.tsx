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
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete, Add, Person } from '@mui/icons-material';
import { useUsers } from '../../hooks/useUsers';

interface UserListProps {
  contestId: string;
}

export const UserList: React.FC<UserListProps> = ({ contestId }) => {
  const {
    users,
    loading,
    error,
    createUser,
    deleteUser,
  } = useUsers(contestId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [atcoderId, setAtcoderId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUser = async () => {
    if (!atcoderId.trim()) return;

    try {
      setIsCreating(true);
      await createUser({
        atcoderId: atcoderId.trim(),
      });
      setIsDialogOpen(false);
      setAtcoderId('');
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('このユーザーを削除してもよろしいですか？')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">参加者一覧</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
          disabled={loading}
        >
          ユーザーを追加
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          まだ参加者が追加されていません
        </Typography>
      ) : (
        <List>
          {users.map((user) => (
            <ListItem
              key={user.id}
              divider
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Person sx={{ mr: 2, color: 'primary.main' }} />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: user.ratingColor }}>
                      {user.atcoderId}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Link
                    href={`https://atcoder.jp/users/${user.atcoderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                  >
                    AtCoderプロフィールを見る
                  </Link>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteUser(user.id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Create User Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ユーザーを追加</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="AtCoder ID"
            fullWidth
            variant="outlined"
            value={atcoderId}
            onChange={(e) => setAtcoderId(e.target.value)}
            placeholder="tourist"
            helperText="AtCoderのユーザーIDを入力してください"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
            キャンセル
          </Button>
          <Button 
            onClick={handleCreateUser} 
            variant="contained" 
            disabled={isCreating || !atcoderId.trim()}
          >
            {isCreating ? <CircularProgress size={20} /> : '追加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}; 