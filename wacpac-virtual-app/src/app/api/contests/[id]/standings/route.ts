import { NextRequest, NextResponse } from 'next/server';
import { StandingsService } from '../../../../../backend/services/StandingsService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    const standings = await StandingsService.calculateStandings(contestId);

    return NextResponse.json(standings);
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    return NextResponse.json(
      { error: '順位表の取得に失敗しました' },
      { status: 500 }
    );
  }
} 