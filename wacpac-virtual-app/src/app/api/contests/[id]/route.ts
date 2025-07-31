import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../backend/utils/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const contest = await prisma.contest.findUnique({
      where: { id },
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'コンテストが見つかりません' },
        { status: 404 }
      );
    }

    await prisma.contest.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'コンテストを削除しました' });
  } catch (error) {
    console.error('Failed to delete contest:', error);
    return NextResponse.json(
      { error: 'コンテストの削除に失敗しました' },
      { status: 500 }
    );
  }
} 