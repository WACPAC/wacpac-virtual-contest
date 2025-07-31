import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../backend/utils/prisma';
import { ScrapingService } from '../../../../../backend/services/ScrapingService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    const problems = await prisma.problem.findMany({
      where: { contestId },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error('Failed to fetch problems:', error);
    return NextResponse.json(
      { error: '問題の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;
    const { problemUrl: url, points } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '問題URLは必須です' },
        { status: 400 }
      );
    }

    if (!points || typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { error: '得点は正の数値である必要があります' },
        { status: 400 }
      );
    }

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'コンテストが見つかりません' },
        { status: 404 }
      );
    }

    // Check if problem URL already exists in this contest
    const existingProblem = await prisma.problem.findFirst({
      where: {
        contestId,
        problemUrl: url,
      },
    });

    if (existingProblem) {
      return NextResponse.json(
        { error: 'この問題URLは既に追加されています' },
        { status: 400 }
      );
    }

    // Scrape problem information
    const scrapedInfo = await ScrapingService.scrapeProblemInfo(url);

    // Get the next order index
    const lastProblem = await prisma.problem.findFirst({
      where: { contestId },
      orderBy: { orderIndex: 'desc' },
    });

    const orderIndex = lastProblem ? lastProblem.orderIndex + 1 : 0;

    const problem = await prisma.problem.create({
      data: {
        name: scrapedInfo.name,
        problemUrl: url,
        submissionUrl: scrapedInfo.submissionUrl,
        points,
        orderIndex,
        contestId,
      },
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    console.error('Failed to create problem:', error);
    return NextResponse.json(
      { error: '問題の作成に失敗しました' },
      { status: 500 }
    );
  }
} 