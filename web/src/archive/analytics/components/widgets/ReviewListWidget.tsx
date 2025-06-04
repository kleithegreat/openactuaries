import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { MOCK_REVIEW_LIST } from '@/lib/mock/analytics';

export function ReviewListWidget() {
  const [problems, _setProblems] = useState(MOCK_REVIEW_LIST);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Review List</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100%-2rem)] pr-4">
          {problems.map(problem => (
            <div key={problem.id} className="mb-4 p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  Question {problem.questionNumber}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{problem.timeSpent}s</span>
                  {problem.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{problem.notes}</p>
              <Button variant="outline" size="sm" className="w-full">
                Review
              </Button>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
