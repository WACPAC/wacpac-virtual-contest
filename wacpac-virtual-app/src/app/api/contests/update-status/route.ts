import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../backend/utils/prisma';

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    
    // Get all running contests to check if they should end
    const runningContests = await prisma.contest.findMany({
      where: {
        status: 'running',
        startTime: { not: null },
      },
    });

    let updatedCount = 0;

    for (const contest of runningContests) {
      if (contest.startTime) {
        const endTime = new Date(contest.startTime.getTime() + contest.durationMinutes * 60 * 1000);
        
        // If current time is past the end time, mark contest as finished
        if (now >= endTime) {
          await prisma.contest.update({
            where: { id: contest.id },
            data: { status: 'after' },
          });
          updatedCount++;
          console.log(`Contest ${contest.name} (${contest.id}) ended at ${endTime.toISOString()}`);
        }
      }
    }

    return NextResponse.json({ 
      message: `Contest statuses updated. ${updatedCount} contests ended.`,
      updatedCount 
    });
  } catch (error: any) {
    console.error('Failed to update contest statuses:', error);
    return NextResponse.json(
      { error: 'ステータス更新に失敗しました' },
      { status: 500 }
    );
  }
} 