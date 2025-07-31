import { prisma } from '../utils/prisma';
import { StandingsEntry, ProblemResult, Contest } from '../../frontend/types';
import { CLIENT_STATIC_FILES_RUNTIME_AMP } from 'next/dist/shared/lib/constants';

export class StandingsService {
  static async calculateStandings(contestId: string): Promise<StandingsEntry[]> {
    // Get contest with problems and users
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        problems: {
          orderBy: { orderIndex: 'asc' }
        },
        users: true,
        _count: {
          select: {
            problems: true,
            users: true
          }
        }
      }
    });

    if (!contest) {
      throw new Error('Contest not found');
    }

    // Get all submissions for this contest
    const submissions = await prisma.submission.findMany({
      where: {
        problem: {
          contestId: contestId
        }
      },
      include: {
        user: true,
        problem: true
      },
      orderBy: {
        submittedAt: 'asc'
      }
    });

    // Calculate standings for each user
    const StandingsMap = new Map<string, StandingsEntry>();

    for (const user of contest.users) {
      const userSubmissions = submissions.filter(s => s.userId === user.id);
      const problemResults: ProblemResult[] = [];
      let totalScore = 0;
      let totalPenalty = 0;
      let totalTime = 0; // This will be the sum of AC times + penalties

      for (const problem of contest.problems) {
        const problemSubmissions = userSubmissions
          .filter(s => s.problemId === problem.id)
          .filter(s => s.status !== 'CE'); // Exclude compilation errors

        let accepted = false;
        let acceptedAt: Date | undefined;
        let attempts = problemSubmissions.length;
        let penalty = 0;

        // Find first AC submission
        for (const submission of problemSubmissions) {
          if (submission.status === 'AC') {
            accepted = true;
            acceptedAt = submission.submittedAt;
            // Count penalties (non-AC submissions before first AC)
            penalty = problemSubmissions
              .filter(s => s.submittedAt < submission.submittedAt && s.status !== 'AC')
              .length;
            break;
          }
        }

        const result: ProblemResult = {
          problemId: problem.id,
          score: accepted ? problem.points : 0,
          attempts,
          acceptedAt: acceptedAt?.toISOString(),
          penalty
        };

        problemResults.push(result);

        if (accepted) {
          totalScore += problem.points;
          totalPenalty += penalty;
          // Calculate AC time in minutes from contest start
          const acceptedTimeMinutes = acceptedAt!.getTime() - contest.startTime!.getTime();
          totalTime = Math.max(totalTime, acceptedTimeMinutes);
        }
      }

      StandingsMap.set(user.id, {
        rank: 0, // Will be calculated later
        user: {
          ...user,
          ratingColor: user.ratingColor || 'black'
        },
        totalScore,
        penalty: totalPenalty,
        totalTime,
        problemResults
      });
    }

    // Convert to array and sort
    const standings = Array.from(StandingsMap.values());
    
    // Sort by: 1) Total score (desc), 2) Total time (asc)
    standings.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.totalTime - b.totalTime;
    });

    // Assign ranks (handle ties properly)
    let currentRank = 1;
    for (let i = 0; i < standings.length; i++) {
      if (i > 0) {
        const prev = standings[i - 1];
        const curr = standings[i];
        if (prev.totalScore !== curr.totalScore || prev.totalTime !== curr.totalTime) {
          currentRank = i + 1;
        }
      }
      standings[i].rank = currentRank;
    }

    return standings;
  }

  static generateCSV(standings: StandingsEntry[], problems: any[], contest: any): string {
    const headers = ['順位', 'ユーザー名', '得点', '時間'];
    problems.forEach((_, index) => {
      headers.push(String.fromCharCode(65 + index)); // A, B, C, ...
    });

    const rows = [headers];

    for (const entry of standings) {
      const time = (entry.totalTime * 1000 + entry.penalty * 5 * 60 * 1000 - (contest?.startTime ? Math.floor(new Date(contest.startTime).getTime() / 1000) : 0)) / 1000;
      const row = [
        entry.rank.toString(),
        entry.user.atcoderId,
        entry.totalScore.toString(),
        `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`
      ];

      for (const result of entry.problemResults) {
        if (result.score > 0) {
          row.push(result.score.toString());
        } else if (result.attempts > 0) {
          row.push(`(${result.attempts})`);
        } else {
          row.push('');
        }
      }

      rows.push(row);
    }

    const csvContent = rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Add UTF-8 BOM to fix Japanese character encoding issues
    const BOM = '\uFEFF';
    return BOM + csvContent;
  }
} 