import { NextRequest, NextResponse } from 'next/server';
import { StandingsService } from '../../../../../../backend/services/StandingsService';
import { prisma } from '../../../../../../backend/utils/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    // Get standings
    const standings = await StandingsService.calculateStandings(contestId);
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    // Get problems for CSV headers
    const problems = await prisma.problem.findMany({
      where: { contestId },
      orderBy: { orderIndex: 'asc' }
    });

    // Generate CSV
    const csv = StandingsService.generateCSV(standings, problems, contest);

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="standings-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Failed to export standings:', error);
    return NextResponse.json(
      { error: 'CSVエクスポートに失敗しました' },
      { status: 500 }
    );
  }
} 