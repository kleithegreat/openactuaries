'use client'
import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'

interface DayHours { name: string; hours: number }
interface Performance { name: string; value: number; optimal: boolean }

const TimeSection = () => {
  const [weekdayDistribution, setWeekdayDistribution] = useState<DayHours[]>([])
  const [studyDates, setStudyDates] = useState<Date[]>([])
  const [timePerformanceData, setTimePerformanceData] = useState<Performance[]>([])
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number; monthDays: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/time')
      .then(res => res.ok ? res.json() : null)
      .then(res => {
        if (res) {
          setWeekdayDistribution(res.weekdayDistribution)
          setStudyDates(res.studyDates.map((d: string) => new Date(d)))
          setTimePerformanceData(res.timePerformance)
          setStreak(res.streak)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <Skeleton className="h-72 w-full bg-background-secondary" />
        <Skeleton className="h-72 w-full bg-background-secondary" />
        <Skeleton className="h-72 w-full bg-background-secondary" />
        <Skeleton className="h-24 w-full bg-background-secondary xl:col-span-3" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      <div className="bg-background-highlight p-4 rounded-xl border border-border xl:col-span-1 flex flex-col h-full">
        <h3 className="font-serif text-base font-semibold mb-3">Study Calendar</h3>
        <div className="flex flex-col h-full">
          <div className="flex-grow w-full flex justify-center">
            <Calendar
              mode="multiple"
              selected={studyDates}
              className="rounded-md border bg-background w-full"
              classNames={{ months: 'w-full flex justify-center' }}
            />
          </div>
          <div className="flex mt-2 divide-x divide-border">
            <div className="flex-1 text-center px-2">
              <div className="text-xl font-semibold text-foreground">{streak ? streak.currentStreak : '–'}</div>
              <div className="text-foreground-secondary text-xs">Current streak</div>
            </div>
            <div className="flex-1 text-center px-2">
              <div className="text-xl font-semibold text-foreground">{streak ? streak.longestStreak : '–'}</div>
              <div className="text-foreground-secondary text-xs">Longest streak</div>
            </div>
            <div className="flex-1 text-center px-2">
              <div className="text-xl font-semibold text-foreground">{streak ? streak.monthDays : '–'}</div>
              <div className="text-foreground-secondary text-xs">Days this month</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-background-highlight p-4 rounded-xl border border-border flex flex-col h-full">
        <h3 className="font-serif text-base font-semibold mb-3">Day of Week Distribution</h3>
        <div className="flex-grow w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weekdayDistribution}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground-secondary))" 
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--foreground-secondary))"
                tickFormatter={(value) => `${value}h`}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip
                cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background-highlight))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value} hours`, 'Study Time']}
              />
              <Bar 
                dataKey="hours" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                background={{ fill: 'rgba(0, 0, 0, 0.03)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-background-highlight p-4 rounded-xl border border-border flex flex-col h-full">
        <h3 className="font-serif text-base font-semibold mb-3">Performance by Time of Day</h3>
        <div className="flex-grow w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timePerformanceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="name" stroke="hsl(var(--foreground-secondary))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="number" domain={[0, 100]} stroke="hsl(var(--foreground-secondary))" tickFormatter={(v) => `${v}%`} fontSize={12} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Accuracy']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background-highlight))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 xl:col-span-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-success h-3 w-3"></div>
          <h3 className="font-serif text-base font-semibold text-primary">Study Time Recommendation</h3>
        </div>
        <p className="text-foreground-secondary text-sm mt-1">
          Based on your performance data, your optimal study times appear to be <strong>early morning (5AM-9AM)</strong> and <strong>evening (6PM-10PM)</strong>. 
          Consider scheduling your most challenging topics during these high-performance periods.
        </p>
      </div>
    </div>
  )
}

export default TimeSection
