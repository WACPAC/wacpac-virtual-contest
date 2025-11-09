import { Contest } from "../types";

export const getContestStatus = (contest: Contest) => {
  if (!contest.startTime) {
    return 'before';
  }
  const now = new Date();
  const startTime = new Date(contest.startTime!);
  const endTime = new Date(startTime.getTime() + contest.durationMinutes * 60 * 1000);
  if (now < startTime) {
    return 'before';
  } else if (now >= startTime && now <= endTime) {
    return 'running';
  } else {
    return 'after';
  }
};