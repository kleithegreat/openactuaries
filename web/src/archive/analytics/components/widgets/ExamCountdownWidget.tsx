import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'
import { MOCK_EXAM_INFO } from '@/lib/mock/analytics'

export function ExamCountdownWidget() {
  const [examInfo, _setExamInfo] = useState(MOCK_EXAM_INFO)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    if (!examInfo?.examDate) return

    const calculateCountdown = () => {
      const now = new Date()
      const examDate = new Date(examInfo.examDate)

      setCountdown({
        days: differenceInDays(examDate, now),
        hours: differenceInHours(examDate, now) % 24,
        minutes: differenceInMinutes(examDate, now) % 60
      })
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000 * 60) // Update every minute

    return () => clearInterval(timer)
  }, [examInfo])

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Exam Countdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">{examInfo.examType}</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-sky-900">
                {countdown.days}
              </div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sky-900">
                {countdown.hours}
              </div>
              <div className="text-sm text-gray-600">Hours</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sky-900">
                {countdown.minutes}
              </div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}