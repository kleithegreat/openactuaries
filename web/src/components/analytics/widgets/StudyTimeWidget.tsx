import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MOCK_STUDY_TIME } from '@/lib/mock/analytics'
import { WidgetSettings } from '@/types/analytics'

interface StudyTimeWidgetProps {
  settings?: WidgetSettings;
  onUpdateSettings: (settings: WidgetSettings) => void;
}

export function StudyTimeWidget({ settings, onUpdateSettings }: StudyTimeWidgetProps) {
  const [data, _setData] = useState(MOCK_STUDY_TIME)
  const displayType = (settings?.displayType ?? 'chart') as 'chart' | 'numbers'

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Study Time</CardTitle>
        <Select
          value={displayType}
          onValueChange={(value: 'chart' | 'numbers') => onUpdateSettings({ ...settings, displayType: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue>{displayType}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chart">Chart</SelectItem>
            <SelectItem value="numbers">Numbers</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        {displayType === 'chart' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-900">
                {data.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-900">
                {(data.reduce((acc, d) => acc + d.hours, 0) / data.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Daily Hours</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}