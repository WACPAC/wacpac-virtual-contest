import { useState, useEffect } from 'react';
import { Problem, CreateProblemRequest } from '../types';
import { problemAPI } from '../api/client';

export const useProblems = (contestId: string) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await problemAPI.getByContest(contestId);
      setProblems(response.data.sort((a, b) => a.orderIndex - b.orderIndex));
      setError(null);
    } catch (err) {
      setError('問題の取得に失敗しました');
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProblem = async (data: CreateProblemRequest) => {
    try {
      const response = await problemAPI.create(contestId, data);
      setProblems(prev => [...prev, response.data].sort((a, b) => a.orderIndex - b.orderIndex));
      return response.data;
    } catch (err) {
      setError('問題の作成に失敗しました');
      console.error('Failed to create problem:', err);
      throw err;
    }
  };

  const deleteProblem = async (problemId: string) => {
    try {
      await problemAPI.delete(contestId, problemId);
      setProblems(prev => prev.filter(problem => problem.id !== problemId));
    } catch (err) {
      setError('問題の削除に失敗しました');
      console.error('Failed to delete problem:', err);
      throw err;
    }
  };

  const updateProblemOrder = async (problemIds: string[]) => {
    try {
      await problemAPI.updateOrder(contestId, problemIds);
      setProblems(prev => {
        const problemMap = new Map(prev.map(p => [p.id, p]));
        return problemIds.map((id, index) => ({
          ...problemMap.get(id)!,
          orderIndex: index,
        }));
      });
    } catch (err) {
      setError('問題の順序更新に失敗しました');
      console.error('Failed to update problem order:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (contestId) {
      fetchProblems();
    }
  }, [contestId]);

  return {
    problems,
    loading,
    error,
    createProblem,
    deleteProblem,
    updateProblemOrder,
    refetch: fetchProblems,
  };
}; 