import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../backend/utils/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'コンテストが見つかりません' },
        { status: 404 }
      );
    }

    if (contest.status !== 'before') {
      return NextResponse.json(
        { error: 'このコンテストは既に開始されているか終了しています' },
        { status: 400 }
      );
    }

    // Start the contest
    const updatedContest = await prisma.contest.update({
      where: { id: contestId },
      data: {
        status: 'running',
        startTime: new Date()
      }
    });

    return NextResponse.json(updatedContest);
  } catch (error: any) {
    console.error('Failed to start contest:', error);
    return NextResponse.json(
      { error: 'コンテストの開始に失敗しました' },
      { status: 500 }
    );
  }
} 