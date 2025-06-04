import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { MOCK_PROBLEM_DIFFICULTY } from '@/lib/mock/analytics';

export function ProblemDifficultyWidget() {
  const [data, _setData] = useState(MOCK_PROBLEM_DIFFICULTY);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Problem Difficulty Performance</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="difficulty" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Accuracy"
              dataKey="accuracy"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
