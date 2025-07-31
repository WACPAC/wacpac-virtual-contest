import axios from 'axios';
import { Contest, Problem, User, StandingsEntry, CreateContestRequest, CreateProblemRequest, CreateUserRequest } from '../types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contest APIs
export const contestAPI = {
  getAll: () => apiClient.get<Contest[]>('/contests'),
  create: (data: CreateContestRequest) => apiClient.post<Contest>('/contests', data),
  delete: (id: string) => apiClient.delete(`/contests/${id}`),
  start: (id: string) => apiClient.post<Contest>(`/contests/${id}/start`),
};

// Problem APIs
export const problemAPI = {
  getByContest: (contestId: string) => apiClient.get<Problem[]>(`/contests/${contestId}/problems`),
  create: (contestId: string, data: CreateProblemRequest) => 
    apiClient.post<Problem>(`/contests/${contestId}/problems`, data),
  delete: (contestId: string, problemId: string) => 
    apiClient.delete(`/contests/${contestId}/problems/${problemId}`),
  updateOrder: (contestId: string, problemIds: string[]) =>
    apiClient.put(`/contests/${contestId}/problems/order`, { problemIds }),
};

// User APIs
export const userAPI = {
  getByContest: (contestId: string) => apiClient.get<User[]>(`/contests/${contestId}/users`),
  create: (contestId: string, data: CreateUserRequest) => 
    apiClient.post<User>(`/contests/${contestId}/users`, data),
  delete: (contestId: string, userId: string) => 
    apiClient.delete(`/contests/${contestId}/users/${userId}`),
};

// Standings APIs
export const StandingsAPI = {
  get: (contestId: string) => apiClient.get<StandingsEntry[]>(`/contests/${contestId}/standings`),
  update: (contestId: string) => apiClient.post(`/contests/${contestId}/standings/update`),
  exportCSV: (contestId: string) => {
    // Create a link and trigger download
    const url = `${API_BASE_URL}/contests/${contestId}/standings/export`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `standings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
}; 