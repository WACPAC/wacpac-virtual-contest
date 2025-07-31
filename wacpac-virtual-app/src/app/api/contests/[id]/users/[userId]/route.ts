import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../backend/utils/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: contestId, userId } = await params;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        contestId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'ユーザーを削除しました' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
} 