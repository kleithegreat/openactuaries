'use client';
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle, XCircle, ArrowRight, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface AccuracyPoint {
  month: string;
  value: number;
}
interface VolumePoint {
  month: string;
  problems: number;
}
interface RecentProblem {
  id: string;
  questionNumber: number;
  exam: string;
  date: string;
  category: string;
  isCorrect: boolean;
  timeSpent: number;
}

const HistorySection = () => {
  const [accuracyHistoryData, setAccuracyHistoryData] = useState<
    AccuracyPoint[]
  >([]);
  const [volumeHistoryData, setVolumeHistoryData] = useState<VolumePoint[]>([]);
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/history')
      .then(res => (res.ok ? res.json() : null))
      .then(res => {
        if (res) {
          setAccuracyHistoryData(res.accuracyHistory);
          setVolumeHistoryData(res.volumeHistory);
          setRecentProblems(res.recentProblems);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full bg-background-secondary" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full bg-background-secondary lg:col-span-2" />
          <Skeleton className="h-56 w-full bg-background-secondary lg:col-span-2" />
          <Skeleton className="h-[400px] w-full bg-background-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-background-secondary/50 p-4 rounded-xl border border-border">
        <h3 className="font-serif text-base font-semibold mb-3 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          Progress Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-background rounded-lg border border-success/20">
            <p className="text-foreground-secondary text-sm">
              Your accuracy has increased from{' '}
              <span className="text-foreground">60%</span> to{' '}
              <span className="text-success font-medium">82%</span> in 6 months.
            </p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-primary/20">
            <p className="text-foreground-secondary text-sm">
              Problem-solving speed improved by{' '}
              <span className="text-primary font-medium">15%</span> since you
              began studying.
            </p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-chart-2/20">
            <p className="text-foreground-secondary text-sm">
              Weekly problem volume is up{' '}
              <span className="text-chart-2 font-medium">3.4×</span> since you
              started.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-highlight p-4 rounded-xl border border-border">
            <h3 className="font-serif text-base font-semibold mb-3">
              Accuracy History
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={accuracyHistoryData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
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
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-background-highlight p-4 rounded-xl border border-border">
            <h3 className="font-serif text-base font-semibold mb-3">
              Problems Solved
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={volumeHistoryData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
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
                  <Area
                    type="monotone"
                    dataKey="problems"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-background-highlight p-4 rounded-xl border border-border flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-base font-semibold">
              Recently Solved Problems
            </h3>
            <Select defaultValue="problems">
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background-highlight">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="problems">All Problems</SelectItem>
                <SelectItem value="incorrect">Incorrect Only</SelectItem>
                <SelectItem value="flagged">Flagged Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            {recentProblems.map(problem => (
              <div
                key={problem.id}
                className="p-3 rounded-lg border border-border bg-background flex flex-col h-28"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {problem.isCorrect ? (
                    <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                  )}
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {problem.exam} Exam: Q{problem.questionNumber}
                  </h4>
                </div>

                <div className="text-xs text-foreground-secondary mb-0.5">
                  {format(problem.date, 'MMM d, yyyy')}
                </div>

                <div className="flex items-center gap-5 mt-1">
                  <div>
                    <div className="text-foreground-secondary text-xs">
                      Category
                    </div>
                    <div className="text-foreground text-xs font-medium">
                      {problem.category}
                    </div>
                  </div>

                  <div>
                    <div className="text-foreground-secondary text-xs">
                      Time
                    </div>
                    <div className="text-foreground text-xs font-medium">
                      {problem.timeSpent}s
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex justify-end">
                  <button className="text-primary text-xs flex items-center gap-1">
                    Review <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;
