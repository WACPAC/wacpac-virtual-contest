import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../backend/utils/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; problemId: string }> }
) {
  try {
    const { id: contestId, problemId } = await params;

    // Check if problem exists and belongs to the contest
    const problem = await prisma.problem.findFirst({
      where: {
        id: problemId,
        contestId: contestId
      }
    });

    if (!problem) {
      return NextResponse.json(
        { error: '問題が見つかりません' },
        { status: 404 }
      );
    }

    // Delete the problem (cascade will handle submissions)
    await prisma.problem.delete({
      where: { id: problemId }
    });

    return NextResponse.json({ message: '問題を削除しました' });
  } catch (error) {
    console.error('Failed to delete problem:', error);
    return NextResponse.json(
      { error: '問題の削除に失敗しました' },
      { status: 500 }
    );
  }
} 