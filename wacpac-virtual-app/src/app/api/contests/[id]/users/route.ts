import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../backend/utils/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    const users = await prisma.user.findMany({
      where: { contestId },
      orderBy: { atcoderId: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
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
    const { atcoderId } = await request.json();

    if (!atcoderId || typeof atcoderId !== 'string') {
      return NextResponse.json(
        { error: 'AtCoderIDは必須です' },
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

    // Check if user already exists in this contest
    const existingUser = await prisma.user.findFirst({
      where: {
        contestId,
        atcoderId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このAtCoderIDは既に追加されています' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        atcoderId,
        contestId,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    );
  }
} 