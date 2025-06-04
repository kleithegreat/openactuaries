import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Clock, Target, Home } from 'lucide-react';
import Link from 'next/link';
import { Answer, Problem } from '../types';

interface SessionSummaryProps {
  problems: Problem[];
  answers: Answer[];
  onNewSession: () => void;
}

export default function SessionSummary({
  problems: _problems,
  answers,
  onNewSession,
}: SessionSummaryProps) {
  const correctAnswers = answers.filter(a => a.isCorrect);
  const accuracy =
    answers.length > 0 ? (correctAnswers.length / answers.length) * 100 : 0;

  const avgTime =
    answers.length > 0
      ? answers.reduce(
          (sum: number, answer: Answer) => sum + answer.timeSpent,
          0,
        ) / answers.length
      : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-background-highlight border-border">
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {accuracy.toFixed(0)}%
              </div>
              <div className="text-foreground-secondary">Accuracy</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {Math.round(avgTime)}s
              </div>
              <div className="text-foreground-secondary">
                Avg Time per Problem
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {correctAnswers.length} / {answers.length}
              </div>
              <div className="text-foreground-secondary">Problems</div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-background/50 rounded-lg border border-border text-center">
            <p className="text-foreground">
              {accuracy >= 80
                ? "Great job! You're making excellent progress."
                : accuracy >= 60
                  ? 'Good work! Keep practicing to improve your skills.'
                  : "Keep practicing! You'll improve with consistent effort."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onNewSession}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Practice Again
        </Button>

        <Link href="/analytics" className="sm:mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            View Analytics
          </Button>
        </Link>

        <Link href="/home">
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
