import { useState, useEffect } from 'react';
import { User, CreateUserRequest } from '../types';
import { userAPI } from '../api/client';

export const useUsers = (contestId: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getByContest(contestId);
      setUsers(response.data.sort((a, b) => a.atcoderId.localeCompare(b.atcoderId)));
      setError(null);
    } catch (err) {
      setError('ユーザーの取得に失敗しました');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserRequest) => {
    try {
      const response = await userAPI.create(contestId, data);
      setUsers(prev => [...prev, response.data].sort((a, b) => a.atcoderId.localeCompare(b.atcoderId)));
      return response.data;
    } catch (err) {
      setError('ユーザーの作成に失敗しました');
      console.error('Failed to create user:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await userAPI.delete(contestId, userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      setError('ユーザーの削除に失敗しました');
      console.error('Failed to delete user:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (contestId) {
      fetchUsers();
    }
  }, [contestId]);

  return {
    users,
    loading,
    error,
    createUser,
    deleteUser,
    refetch: fetchUsers,
  };
}; 