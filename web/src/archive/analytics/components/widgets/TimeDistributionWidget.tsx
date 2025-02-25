import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MOCK_TIME_DISTRIBUTION } from '@/lib/mock/analytics'

export function TimeDistributionWidget() {
  const [data, _setData] = useState(MOCK_TIME_DISTRIBUTION)

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Time Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis
              label={{
                value: 'Average Time (minutes)',
                angle: -90,
                position: 'insideLeft'
              }}
            />
            <Tooltip />
            <Bar dataKey="averageTime" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}