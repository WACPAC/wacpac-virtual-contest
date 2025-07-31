import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../backend/utils/prisma';
import * as cheerio from 'cheerio';
import { assert } from 'console';

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

    const atcoderPage = await fetch(`https://atcoder.jp/users/${atcoderId}`);
    if (atcoderPage.status !== 200) {
      return NextResponse.json(
        { error: 'AtCoderIDが見つかりません' },
        { status: 404 }
      );
    }

    const atcoderPageText = await atcoderPage.text();
    
    // Use cheerio to parse HTML and extract rating color
    const $ = cheerio.load(atcoderPageText);
    
    // Find the user rating color from the username span
    let ratingColor: string = 'default';
    
    // Look for spans with user color classes (user-gray, user-brown, user-green, user-cyan, user-blue, user-yellow, user-orange, user-red)
    const userColorClasses = ['user-gray', 'user-brown', 'user-green', 'user-cyan', 'user-blue', 'user-yellow', 'user-orange', 'user-red'];
    
    for (const colorClass of userColorClasses) {
      if ($(`.${colorClass}`).length > 0) {
        ratingColor = colorClass.split('-')[1];
        break;
      }
    }
    
    if (!ratingColor) {
      ratingColor = 'red';
    }
    assert(userColorClasses.includes(ratingColor), `Invalid rating color: ${ratingColor}`);

    ratingColor = {
      'cyan': '#21A0DB',
      'yellow': '#FFC800',
    }[ratingColor] || ratingColor;

    const user = await prisma.user.create({
      data: {
        atcoderId,
        contestId,
        ratingColor,
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