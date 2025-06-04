'use client';

import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle, Clock, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInCalendarDays, format } from 'date-fns';

interface TrendPoint {
  date: string;
  value: number;
}
interface HistoryPoint {
  month: string;
  value: number;
}

interface OverviewData {
  totalProblemsSolved: number;
  totalStudyHours: number;
  accuracy: number;
}

const OverviewSection = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  interface ExamInfo {
    examType: string;
    examDate: Date;
    daysLeft: number;
  }
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [accuracyData, setAccuracyData] = useState<TrendPoint[]>([]);
  const [activityData, setActivityData] = useState<
    { day: string; problems: number }[]
  >([]);
  const [weekly, setWeekly] = useState<{
    problems: number;
    problemsPrev: number;
    study: number;
    studyPrev: number;
    accuracy: number;
    accuracyPrev: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await fetch('/api/profile');
        const profile = profileRes.ok ? await profileRes.json() : null;
        if (profile?.examRegistrations?.length) {
          const regs = profile.examRegistrations.map((reg: { examType: string; examDate: string }) => {
            const date = new Date(reg.examDate);
            return {
              examType: reg.examType,
              examDate: date,
              daysLeft: Math.max(0, differenceInCalendarDays(date, new Date())),
            };
          });
          setExams(regs);
        }

        const [overviewRes, historyRes, timeRes] = await Promise.all([
          fetch('/api/analytics/overview'),
          fetch('/api/analytics/history'),
          fetch('/api/analytics/time'),
        ]);

        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          setData(overview);
        }

        if (historyRes.ok) {
          const history = await historyRes.json();
          setAccuracyData(
            history.accuracyHistory.map((p: HistoryPoint) => ({
              date: p.month,
              value: p.value,
            })),
          );
        }

        if (timeRes.ok) {
          const time = await timeRes.json();
          setActivityData(time.weekdayDistribution);
          setWeekly({
            problems: time.weeklyReport.problems.current,
            problemsPrev: time.weeklyReport.problems.previous,
            study: time.weeklyReport.studyHours.current,
            studyPrev: time.weeklyReport.studyHours.previous,
            accuracy: time.weeklyReport.accuracy.current,
            accuracyPrev: time.weeklyReport.accuracy.previous,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full bg-background-secondary" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full bg-background-secondary" />
          <Skeleton className="h-64 w-full bg-background-secondary" />
        </div>
        <Skeleton className="h-40 w-full bg-background-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-background-highlight p-6 rounded-xl border border-border">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            {exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map((exam, i) => {
                  const progress = Math.max(0, Math.min(100, 100 - Math.round((exam.daysLeft / 90) * 100)));
                  return (
                    <div key={i} className="space-y-2">
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        Exam {exam.examType}: {format(exam.examDate, 'MMMM d, yyyy')}
                      </h3>
                      <p className="text-foreground-secondary text-sm">
                        {exam.daysLeft} days remaining
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground-secondary">Study Progress</span>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <h3 className="font-serif text-lg font-semibold text-foreground">No Exam Registered</h3>
            )}
            <p className="text-sm text-foreground-secondary mt-2">Based on your targeted study plan</p>
          </div>

          <div className="flex gap-4 md:gap-6 w-full md:w-auto">
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {data ? data.totalProblemsSolved : '–'}
              </div>
              <div className="text-xs text-foreground-secondary">
                Problems Solved
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {data ? data.totalStudyHours : '–'}
              </div>
              <div className="text-xs text-foreground-secondary">
                Study Hours
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {data ? `${data.accuracy}%` : '–'}
              </div>
              <div className="text-xs text-foreground-secondary">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background-highlight p-6 rounded-xl border border-border">
          <h3 className="font-serif text-base font-semibold mb-4">
            Accuracy Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={accuracyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--foreground-secondary))"
                />
                <YAxis
                  domain={[50, 100]}
                  tickFormatter={value => `${value}%`}
                  stroke="hsl(var(--foreground-secondary))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background-highlight))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.375rem',
                  }}
                  formatter={value => [`${value}%`, 'Accuracy']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{
                    r: 6,
                    fill: 'hsl(var(--primary))',
                    stroke: 'white',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background-highlight p-6 rounded-xl border border-border">
          <h3 className="font-serif text-base font-semibold mb-4">
            Recent Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground-secondary))"
                />
                <YAxis stroke="hsl(var(--foreground-secondary))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background-highlight))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.375rem',
                  }}
                  formatter={value => [value, 'Problems']}
                />
                <Bar
                  dataKey="problems"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-background-highlight p-6 rounded-xl border border-border">
        <h3 className="font-serif text-base font-semibold mb-4">
          Weekly Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-foreground-secondary text-sm mb-2">
              Problems Solved
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {weekly ? weekly.problems : '–'}
              </span>
              {weekly && (
                <span
                  className={`text-sm ${weekly.problems >= weekly.problemsPrev ? 'text-success' : 'text-destructive'}`}
                >
                  {weekly.problemsPrev
                    ? `${Math.round(((weekly.problems - weekly.problemsPrev) / weekly.problemsPrev) * 100)}%`
                    : '0%'}{' '}
                  from last week
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-foreground-secondary text-sm mb-2">
              Study Time
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {weekly ? `${weekly.study} hours` : '–'}
              </span>
              {weekly && (
                <span
                  className={`text-sm ${weekly.study >= weekly.studyPrev ? 'text-success' : 'text-destructive'}`}
                >
                  {weekly.studyPrev
                    ? `${Math.round(((weekly.study - weekly.studyPrev) / weekly.studyPrev) * 100)}%`
                    : '0%'}{' '}
                  from last week
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-foreground-secondary text-sm mb-2">Accuracy</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {weekly ? `${weekly.accuracy}%` : '–'}
              </span>
              {weekly && (
                <span
                  className={`text-sm ${weekly.accuracy >= weekly.accuracyPrev ? 'text-success' : 'text-destructive'}`}
                >
                  {weekly.accuracyPrev
                    ? `${Math.round(((weekly.accuracy - weekly.accuracyPrev) / weekly.accuracyPrev) * 100)}%`
                    : '0%'}{' '}
                  from last week
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
