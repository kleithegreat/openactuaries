import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MOCK_PROBLEMS_SOLVED } from '@/lib/mock/analytics'

export function ProblemsSolvedWidget({ settings, onUpdateSettings }) {
  const [data, setData] = useState(MOCK_PROBLEMS_SOLVED)

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Problems Solved</CardTitle>
        <Select
          value={settings?.timeRange || 'month'}
          onValueChange={(value) => onUpdateSettings({ ...settings, timeRange: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue>{settings?.timeRange || 'month'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="problems" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
