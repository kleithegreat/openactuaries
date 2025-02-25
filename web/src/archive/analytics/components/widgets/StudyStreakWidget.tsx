import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { MOCK_STUDY_STREAK } from '@/lib/mock/analytics'

export function StudyStreakWidget() {
  const [data, _setData] = useState(MOCK_STUDY_STREAK)

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Study Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-sky-900">{data.currentStreak}</div>
          <div className="text-gray-600">Day Streak</div>
        </div>
        <Calendar
          mode="multiple"
          selected={data.studyDays.map(d => new Date(d))}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  )
}
