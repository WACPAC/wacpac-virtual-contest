import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../backend/utils/prisma';

export async function GET() {
  try {
    const contests = await prisma.contest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contests);
  } catch (error) {
    console.error('Failed to fetch contests:', error);
    return NextResponse.json(
      { error: 'コンテストの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, durationMinutes } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'コンテスト名は必須です' },
        { status: 400 }
      );
    }

    if (!durationMinutes || durationMinutes <= 0) {
      return NextResponse.json(
        { error: 'コンテスト時間は1分以上である必要があります' },
        { status: 400 }
      );
    }

    const contest = await prisma.contest.create({
      data: {
        name: name.trim(),
        durationMinutes,
        status: 'before'
      }
    });

    return NextResponse.json(contest, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create contest:', error);
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: '同じ名前のコンテストが既に存在します' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'コンテストの作成に失敗しました' },
      { status: 500 }
    );
  }
} 