import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Compass,
  Search,
  BookOpen,
  ExternalLink,
  BarChart,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getRequiredServerSession } from '@/lib/auth/server';
import { format, differenceInCalendarDays, startOfDay } from 'date-fns';
import { prisma } from '@/lib/db';
import PracticeExamDialog from './components/PracticeExamDialog';

export default async function HomePage() {
  const session = await getRequiredServerSession();

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { examRegistrations: true },
  });

  let nextExamDate: Date | null = null;
  let nextExamType: string | null = null;

  if (profile?.examRegistrations.length) {
    const upcoming = profile.examRegistrations
      .filter(r => r.examDate >= new Date())
      .sort((a, b) => a.examDate.getTime() - b.examDate.getTime())[0];
    if (upcoming) {
      nextExamDate = upcoming.examDate;
      nextExamType = upcoming.examType;
    }
  }

  const goalType = profile?.goalType ?? 'PROBLEMS';
  const dailyGoal = profile?.goalAmount ?? 0;

  const startToday = startOfDay(new Date());
  const problemsToday = profile
    ? await prisma.problemAttempt.count({
        where: { profileId: profile.id, createdAt: { gte: startToday } },
      })
    : 0;

  const minutesToday = profile
    ?
        (
          await prisma.studySession.aggregate({
            where: { profileId: profile.id, startTime: { gte: startToday } },
            _sum: { minutesSpent: true },
          })
        )._sum.minutesSpent || 0
    : 0;

  let recommendedTopics: { name: string; percentage: number }[] = [];
  if (profile) {
    const attempts = await prisma.problemAttempt.findMany({
      where: {
        profileId: profile.id,
        problem: { exam: nextExamType ?? 'P' },
      },
      include: { problem: { select: { syllabusCategory: true } } },
    });

    const topicStats: Record<string, { attempts: number; correct: number }> = {};
    for (const a of attempts) {
      const topic = a.problem.syllabusCategory;
      if (!topicStats[topic]) {
        topicStats[topic] = { attempts: 0, correct: 0 };
      }
      topicStats[topic].attempts += 1;
      if (a.isCorrect) topicStats[topic].correct += 1;
    }

    const sorted = Object.entries(topicStats)
      .map(([topic, data]) => ({
        topic,
        accuracy: data.attempts
          ? Math.round((data.correct / data.attempts) * 100)
          : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 4);

    recommendedTopics = sorted.map(t => ({
      name: t.topic,
      percentage: t.accuracy,
    }));
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Welcome back{session.user?.name ? `, ${session.user.name}` : ''}
                !
              </h1>
              <p className="text-foreground-secondary mt-1">
                {nextExamDate ? (
                  <>You have an exam on{' '}
                  <span className="font-medium text-primary">
                    {format(nextExamDate, 'MMMM d, yyyy')}
                  </span>{' '}
                  ({differenceInCalendarDays(nextExamDate, new Date())} days remaining)</>
                ) : (
                  'No exam scheduled'
                )}
              </p>
            </div>

            <div className="flex gap-4 mt-2 md:mt-0">
              <PracticeExamDialog>
                <Button className="gap-2 bg-primary hover:bg-primary-dark">
                  <Compass className="h-4 w-4" />
                  Start Practice
                </Button>
              </PracticeExamDialog>
              <Link href="/analytics">
                <Button variant="outline" className="gap-2 border-border">
                  <BarChart className="h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-background-highlight rounded-xl p-4 border border-border shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {goalType === 'PROBLEMS'
                    ? `${problemsToday}/${dailyGoal} Problems Today`
                    : `${Math.round(minutesToday)}/${dailyGoal} Minutes Today`}
                </div>
                <div className="text-sm text-foreground-secondary">
                  {dailyGoal > 0
                    ? `${Math.round(
                        ((goalType === 'PROBLEMS'
                          ? problemsToday
                          : minutesToday) /
                          dailyGoal) *
                          100,
                      )}% of daily goal`
                    : 'No daily goal set'}
                </div>
              </div>
            </div>

            <PracticeExamDialog>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Compass className="h-4 w-4" />
                Continue Practice
              </Button>
            </PracticeExamDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <PracticeExamDialog>
            <Card className="hover:shadow-md bg-background-highlight border-border transition-all duration-200 h-full overflow-hidden group-hover:border-primary/50 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span>Personalized Practice</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground-secondary text-sm">
                  Get problems tailored to your needs and focus areas. Our
                  algorithm adapts to your performance.
                </p>
                <div className="flex justify-end mt-4">
                  <span className="text-primary text-sm font-medium group-hover:underline">
                    Start session →
                  </span>
                </div>
              </CardContent>
            </Card>
          </PracticeExamDialog>

          <Link href="/questions" className="group">
            <Card className="hover:shadow-md bg-background-highlight border-border transition-all duration-200 h-full overflow-hidden group-hover:border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-full bg-accent/10 text-accent">
                    <Search className="h-4 w-4" />
                  </div>
                  <span>Question Library</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground-secondary text-sm">
                  Browse our extensive question bank with over 700 questions
                  covering all exam topics.
                </p>
                <div className="flex justify-end mt-4">
                  <span className="text-accent text-sm font-medium group-hover:underline">
                    Explore questions →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Recommended Focus Areas
            </h2>
            <Link href="/wiki">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-primary hover:text-primary-dark hover:bg-primary/5"
              >
                <ExternalLink className="h-4 w-4" />
                Exam Wiki
              </Button>
            </Link>
          </div>

          <div className="bg-background-highlight rounded-xl border border-border p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedTopics.map((topic, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {topic.name}
                      </span>
                    </div>
                    <span className="text-sm text-foreground-secondary">
                      {topic.percentage}%
                    </span>
                  </div>
                  <Progress value={topic.percentage} className="h-1.5" />
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-primary hover:text-primary-dark hover:bg-primary/5"
                    >
                      Practice Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
