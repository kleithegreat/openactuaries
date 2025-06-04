import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import {
  format,
  subDays,
  differenceInCalendarDays,
  isSameMonth,
} from 'date-fns';

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

    const sessions = await prisma.studySession.findMany({
      where: { profileId: profile.id },
    });
    const attempts = await prisma.problemAttempt.findMany({
      where: { profileId: profile.id },
      include: { studySession: true },
    });

    const now = new Date();
    const lastWeek = subDays(now, 7);
    const prevWeek = subDays(now, 14);

    let lastWeekMinutes = 0;
    let prevWeekMinutes = 0;
    for (const s of sessions) {
      if (s.startTime >= lastWeek) {
        lastWeekMinutes += s.minutesSpent ?? 0;
      } else if (s.startTime >= prevWeek) {
        prevWeekMinutes += s.minutesSpent ?? 0;
      }
    }

    let lastWeekProblems = 0;
    let prevWeekProblems = 0;
    let lastWeekCorrect = 0;
    let prevWeekCorrect = 0;
    for (const a of attempts) {
      if (a.createdAt >= lastWeek) {
        lastWeekProblems++;
        if (a.isCorrect) lastWeekCorrect++;
      } else if (a.createdAt >= prevWeek) {
        prevWeekProblems++;
        if (a.isCorrect) prevWeekCorrect++;
      }
    }

    const weekdayStats: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };
    const studyDates: string[] = [];

    for (const sessionData of sessions) {
      const day = format(
        sessionData.startTime,
        'EEE',
      ) as keyof typeof weekdayStats;
      weekdayStats[day] += (sessionData.minutesSpent ?? 0) / 60;
      studyDates.push(format(sessionData.startTime, 'yyyy-MM-dd'));
    }

    const uniqueDates = Array.from(new Set(studyDates)).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let prev: Date | null = null;
    for (const dateStr of uniqueDates) {
      const d = new Date(dateStr);
      if (prev && differenceInCalendarDays(d, prev) === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      prev = d;
    }
    // compute current streak from latest backward
    currentStreak = 0;
    prev = null;
    for (const dateStr of uniqueDates.slice().reverse()) {
      const d = new Date(dateStr);
      if (!prev) {
        prev = d;
        currentStreak = 1;
        continue;
      }
      if (differenceInCalendarDays(prev, d) === 1) {
        currentStreak += 1;
        prev = d;
      } else {
        break;
      }
    }
    const monthDays = uniqueDates.filter(d =>
      isSameMonth(new Date(d), new Date()),
    ).length;

    const weekdayDistribution = Object.entries(weekdayStats).map(
      ([name, hours]) => ({
        name,
        hours: Math.round(hours * 10) / 10,
      }),
    );

    const timeStats: Record<string, { attempts: number; correct: number }> = {
      morning: { attempts: 0, correct: 0 },
      midday: { attempts: 0, correct: 0 },
      afternoon: { attempts: 0, correct: 0 },
      evening: { attempts: 0, correct: 0 },
      night: { attempts: 0, correct: 0 },
    };

    const getBucket = (date: Date) => {
      const h = date.getHours();
      if (h >= 5 && h < 9) return 'morning';
      if (h >= 9 && h < 14) return 'midday';
      if (h >= 14 && h < 18) return 'afternoon';
      if (h >= 18 && h < 22) return 'evening';
      return 'night';
    };

    for (const attempt of attempts) {
      const bucket = getBucket(
        attempt.studySession?.startTime ?? attempt.createdAt,
      );
      const stat = timeStats[bucket];
      stat.attempts += 1;
      if (attempt.isCorrect) stat.correct += 1;
    }

    const lastWeekAccuracy = lastWeekProblems
      ? Math.round((lastWeekCorrect / lastWeekProblems) * 100)
      : 0;
    const prevWeekAccuracy = prevWeekProblems
      ? Math.round((prevWeekCorrect / prevWeekProblems) * 100)
      : 0;

    const timePerformance = [
      { name: 'Morning (5AM-9AM)', ...timeStats.morning },
      { name: 'Midday (9AM-2PM)', ...timeStats.midday },
      { name: 'Afternoon (2PM-6PM)', ...timeStats.afternoon },
      { name: 'Evening (6PM-10PM)', ...timeStats.evening },
      { name: 'Night (10PM-1AM)', ...timeStats.night },
    ].map(t => {
      const value = t.attempts ? Math.round((t.correct / t.attempts) * 100) : 0;
      return { name: t.name, value, optimal: value > 75 };
    });

    return NextResponse.json({
      weekdayDistribution,
      studyDates,
      timePerformance,
      weeklyReport: {
        problems: { current: lastWeekProblems, previous: prevWeekProblems },
        studyHours: {
          current: Math.round((lastWeekMinutes / 60) * 10) / 10,
          previous: Math.round((prevWeekMinutes / 60) * 10) / 10,
        },
        accuracy: { current: lastWeekAccuracy, previous: prevWeekAccuracy },
      },
      streak: { currentStreak, longestStreak, monthDays },
    });
  } catch (error) {
    console.error('Error fetching time analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time analytics' },
      { status: 500 },
    );
  }
}
