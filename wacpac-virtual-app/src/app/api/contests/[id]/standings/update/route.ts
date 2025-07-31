import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../backend/utils/prisma';
import { ScrapingService } from '../../../../../../backend/services/ScrapingService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    // Get contest with problems and users
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        problems: true,
        users: true
      }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'コンテストが見つかりません' },
        { status: 404 }
      );
    }

    if (contest.status === 'before') {
      return NextResponse.json(
        { error: 'コンテスト開始前です' },
        { status: 400 }
      );
    }

    console.log(contest.startTime);

    // Calculate contest end time
    let contestEndTime: Date | undefined;
    if (contest.startTime) {
      contestEndTime = new Date(contest.startTime.getTime() + contest.durationMinutes * 60 * 1000);
    }

    // Check if update window has passed (30 minutes after contest end)
    if (contest.status === 'after' && contestEndTime) {
      const updateWindowEnd = new Date(contestEndTime.getTime() + 30 * 60 * 1000); // 30 minutes after end
      const now = new Date();
      
      if (now > updateWindowEnd) {
        return NextResponse.json(
          { error: 'コンテスト終了から30分が経過したため、順位表の更新はできません' },
          { status: 400 }
        );
      }
    }

    // Scrape submissions for each problem
    for (const problem of contest.problems) {
      try {
        console.log(`Scraping submissions for problem: ${problem.id} - ${problem.name}`);
        const userIds = contest.users.map(u => u.atcoderId);
        const scrapedSubmissions = await ScrapingService.scrapeSubmissions(
          problem.submissionUrl,
          userIds,
          contest.startTime || undefined,
          contestEndTime
        );
        console.log(`Finished scraping for problem ${problem.id}: ${scrapedSubmissions.length} submissions found`);

        // Update submissions in database
        for (const submission of scrapedSubmissions) {
          const user = contest.users.find(u => u.atcoderId === submission.userId);
          if (!user) continue;

          // Double-check submission time constraints at API level
          if (contest.startTime && submission.submittedAt < contest.startTime) {
            console.log(`Skipping submission ${submission.submissionId} - before contest start`);
            continue;
          }

          if (contestEndTime && submission.submittedAt > contestEndTime) {
            console.log(`Skipping submission ${submission.submissionId} - after contest end`);
            continue;
          }

          // Check if submission already exists
          const existingSubmission = await prisma.submission.findUnique({
            where: { submissionId: submission.submissionId }
          });

          if (!existingSubmission) {
            await prisma.submission.create({
              data: {
                submissionId: submission.submissionId,
                status: submission.status,
                submittedAt: submission.submittedAt,
                userId: user.id,
                problemId: problem.id
              }
            });
          }
        }
      } catch (error) {
        console.error(`Failed to scrape submissions for problem ${problem.id}:`, error);
      }
    }

    return NextResponse.json({ message: '順位表を更新しました' });
  } catch (error) {
    console.error('Failed to update standings:', error);
    return NextResponse.json(
      { error: '順位表の更新に失敗しました' },
      { status: 500 }
    );
  }
} 