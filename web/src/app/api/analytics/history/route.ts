import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { subMonths, format } from 'date-fns';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const startDate = subMonths(new Date(), 11);
    const attempts = await prisma.problemAttempt.findMany({
      where: { profileId: profile.id, createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        isCorrect: true,
        problem: {
          select: { exam: true, syllabusCategory: true, questionNumber: true },
        },
        timeSpent: true,
      },
    });

    const monthStats: Record<string, { attempts: number; correct: number }> =
      {};
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      const key = format(date, 'MMM yyyy');
      monthStats[key] = { attempts: 0, correct: 0 };
    }

    for (const a of attempts) {
      const key = format(a.createdAt, 'MMM yyyy');
      if (!monthStats[key]) {
        monthStats[key] = { attempts: 0, correct: 0 };
      }
      monthStats[key].attempts++;
      if (a.isCorrect) monthStats[key].correct++;
    }

    const accuracyHistory = Object.entries(monthStats)
      .map(([month, stats]) => ({
        month: month.split(' ')[0],
        value: stats.attempts
          ? Math.round((stats.correct / stats.attempts) * 100)
          : 0,
      }))
      .reverse();

    const volumeHistory = Object.entries(monthStats)
      .map(([month, stats]) => ({
        month: month.split(' ')[0],
        problems: stats.attempts,
      }))
      .reverse();

    const recentAttempts = await prisma.problemAttempt.findMany({
      where: { profileId: profile.id },
      include: { problem: true },
      orderBy: { createdAt: 'desc' },
      take: 9,
    });

    const recentProblems = recentAttempts.map(a => ({
      id: a.id,
      questionNumber: a.problem.questionNumber,
      exam: a.problem.exam,
      date: a.createdAt,
      category: a.problem.syllabusCategory,
      isCorrect: a.isCorrect,
      timeSpent: a.timeSpent,
      isFlagged: a.reviewMarked,
    }));

    return NextResponse.json({
      accuracyHistory,
      volumeHistory,
      recentProblems,
    });
  } catch (error) {
    console.error('Error fetching history analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history analytics' },
      { status: 500 },
    );
  }
}
