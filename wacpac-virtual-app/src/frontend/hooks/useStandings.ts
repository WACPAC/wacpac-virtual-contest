import { useState, useEffect, useCallback, useRef } from 'react';
import { StandingsEntry, Contest } from '../types';
import { StandingsAPI, contestAPI } from '../api/client';
import axios from 'axios';

export const useStandings = (contestId: string) => {
  const [standings, setStandings] = useState<StandingsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const finalUpdateExecuted = useRef<boolean>(false);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await StandingsAPI.get(contestId);
      setStandings(response.data);
      setError(null);
    } catch (err) {
      setError('順位表の取得に失敗しました');
      console.error('Failed to fetch standings:', err);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  const fetchContest = useCallback(async () => {
    try {
      const response = await contestAPI.getAll();
      const foundContest = response.data.find(c => c.id === contestId);
      setContest(foundContest || null);
    } catch (err) {
      console.error('Failed to fetch contest:', err);
    }
  }, [contestId]);

  const updateContestStatus = useCallback(async () => {
    try {
      await axios.post('/api/contests/update-status');
      await fetchContest(); // Refresh contest data after status update
    } catch (err) {
      console.error('Failed to update contest status:', err);
    }
  }, [fetchContest]);

  const performFinalUpdate = useCallback(async () => {
    if (finalUpdateExecuted.current) return;
    
    try {
      finalUpdateExecuted.current = true;
      console.log('Performing final standings update 3 minutes after contest end');
      setUpdating(true);
      await StandingsAPI.update(contestId);
      await fetchStandings();
      setError('コンテスト終了後の最終更新が完了しました');
    } catch (err) {
      console.error('Failed to perform final update:', err);
      setError('最終更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  }, [contestId, fetchStandings]);

  const updateStandings = async () => {
    // Check if contest update window has passed (30 minutes after contest end)
    if (contest && contest.status === 'after' && contest.startTime) {
      const contestStartTime = new Date(contest.startTime);
      const contestEndTime = new Date(contestStartTime.getTime() + contest.durationMinutes * 60 * 1000);
      const updateWindowEnd = new Date(contestEndTime.getTime() + 30 * 60 * 1000); // 30 minutes after end
      const now = new Date();
      
      if (now > updateWindowEnd) {
        setError('コンテスト終了から30分が経過したため、順位表の更新はできません');
        return;
      }
    }

    try {
      setUpdating(true);
      await StandingsAPI.update(contestId);
      await fetchStandings();
    } catch (err) {
      setError('順位表の更新に失敗しました');
      console.error('Failed to update standings:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const exportToCSV = async () => {
    try {
      StandingsAPI.exportCSV(contestId);
    } catch (err) {
      setError('CSVエクスポートに失敗しました');
      console.error('Failed to export CSV:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (contestId) {
      fetchStandings();
      fetchContest();
    }
  }, [contestId, fetchStandings, fetchContest]);

  // Check contest status every minute
  useEffect(() => {
    if (!contestId) return;

    const statusInterval = setInterval(() => {
      updateContestStatus();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(statusInterval);
  }, [contestId, updateContestStatus]);

  // Schedule final update 3 minutes after contest end
  useEffect(() => {
    if (!contest || !contest.startTime || contest.status !== 'running') {
      return;
    }

    const contestEndTime = new Date(new Date(contest.startTime).getTime() + contest.durationMinutes * 60 * 1000);
    const finalUpdateTime = new Date(contestEndTime.getTime() + 3 * 60 * 1000); // 3 minutes after end
    const now = new Date();

    if (now < finalUpdateTime) {
      const timeUntilFinalUpdate = finalUpdateTime.getTime() - now.getTime();
      
      const finalUpdateTimeout = setTimeout(() => {
        performFinalUpdate();
      }, timeUntilFinalUpdate);

      return () => clearTimeout(finalUpdateTimeout);
    }
  }, [contest, performFinalUpdate]);

  // Auto-update standings every 3 minutes only if contest is running
  useEffect(() => {
    if (!contestId || !contest || contest.status !== 'running') return;

    const StandingsInterval = setInterval(() => {
      updateStandings();
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(StandingsInterval);
  }, [contestId, contest?.status]);

  return {
    standings,
    contest,
    loading,
    updating,
    error,
    updateStandings,
    exportToCSV,
    refetch: fetchStandings,
  };
}; 