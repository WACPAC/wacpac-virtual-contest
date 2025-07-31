import { useState, useEffect } from 'react';
import { Contest, CreateContestRequest } from '../types';
import { contestAPI } from '../api/client';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await contestAPI.getAll();
      setContests(response.data);
      setError(null);
    } catch (err) {
      setError('コンテストの取得に失敗しました');
      console.error('Failed to fetch contests:', err);
    } finally {
      setLoading(false);
    }
  };

  const createContest = async (data: CreateContestRequest) => {
    try {
      const response = await contestAPI.create(data);
      setContests(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('コンテストの作成に失敗しました');
      console.error('Failed to create contest:', err);
      throw err;
    }
  };

  const deleteContest = async (id: string) => {
    try {
      await contestAPI.delete(id);
      setContests(prev => prev.filter(contest => contest.id !== id));
    } catch (err) {
      setError('コンテストの削除に失敗しました');
      console.error('Failed to delete contest:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  return {
    contests,
    loading,
    error,
    createContest,
    deleteContest,
    refetch: fetchContests,
  };
}; 