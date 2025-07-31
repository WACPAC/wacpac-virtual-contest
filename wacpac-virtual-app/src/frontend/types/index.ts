export interface Contest {
  id: string;
  name: string;
  status: 'before' | 'running' | 'after';
  startTime?: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
  problems?: Problem[];
  users?: User[];
}

export interface Problem {
  id: string;
  name: string;
  problemUrl: string;
  submissionUrl: string;
  points: number;
  orderIndex: number;
  contestId: string;
  submissions?: Submission[];
}

export interface User {
  id: string;
  atcoderId: string;
  contestId: string;
  submissions?: Submission[];
  ratingColor: string;
}

export interface Submission {
  id: string;
  submissionId: string;
  status: string;
  submittedAt: string;
  userId: string;
  problemId: string;
}

export interface StandingsEntry {
  rank: number;
  user: User;
  totalScore: number;
  penalty: number;
  totalTime: number; // in minutes
  problemResults: ProblemResult[];
}

export interface ProblemResult {
  problemId: string;
  score: number;
  attempts: number;
  acceptedAt?: string;
  penalty: number;
}

export interface CreateContestRequest {
  name: string;
  durationMinutes: number;
}

export interface CreateProblemRequest {
  problemUrl: string;
  points?: number;
}

export interface CreateUserRequest {
  atcoderId: string;
}