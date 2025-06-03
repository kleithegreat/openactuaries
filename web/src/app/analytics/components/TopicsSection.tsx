'use client'
import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TriangleAlert } from 'lucide-react'

interface BreakdownEntry { name: string; value: number; color: string }
interface PerformanceEntry { subject: string; accuracy: number }
interface FocusEntry { topic: string; accuracy: number; problems: number; description: string }

const TopicsSection = () => {
  const [topicBreakdown, setTopicBreakdown] = useState<BreakdownEntry[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceEntry[]>([])
  const [topicsToImprove, setTopicsToImprove] = useState<FocusEntry[]>([])

  useEffect(() => {
    fetch('/api/analytics/topics')
      .then(res => res.ok ? res.json() : null)
      .then((res: { breakdown: { topic: string; value: number }[]; performance: PerformanceEntry[]; toFocus: { topic: string; accuracy: number; problems: number }[] } | null) => {
        if (res) {
          setTopicBreakdown(res.breakdown.map((b, i) => ({ name: b.topic, value: b.value, color: `hsl(var(--chart-${(i%5)+1}))` })))
          setPerformanceData(res.performance)
          setTopicsToImprove(res.toFocus.map(t => ({ ...t, description: '' })))
        }
      })
  }, [])
  return (
    <div className="space-y-6">
      {/* Topic distribution and performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-highlight p-6 rounded-xl border border-border">
          <h3 className="font-serif text-base font-semibold mb-4">Topic Distribution</h3>
          <div className="flex items-center h-64">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {topicBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-background-highlight p-6 rounded-xl border border-border">
          <h3 className="font-serif text-base font-semibold mb-4">Topic Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="hsl(var(--foreground-secondary))" />
                <YAxis type="category" dataKey="subject" stroke="hsl(var(--foreground-secondary))" width={90} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Accuracy']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background-highlight))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.375rem'
                  }}
                />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Areas to improve */}
      <div className="bg-background-highlight p-6 rounded-xl border border-border">
        <h3 className="font-serif text-base font-semibold mb-4">Topics to Focus On</h3>
        <div className="space-y-4">
          {topicsToImprove.map((topic, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border border-border bg-background"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TriangleAlert className="h-4 w-4 text-warning" />
                    <h4 className="font-serif font-medium text-foreground">{topic.topic}</h4>
                  </div>
                  <p className="text-sm text-foreground-secondary mb-2">
                    {topic.description}
                  </p>
                </div>
                
                <div className="flex gap-4 sm:w-48">
                  <div className="flex-1 text-center">
                    <div className="text-lg font-semibold text-foreground">{topic.accuracy}%</div>
                    <div className="text-xs text-foreground-secondary">Accuracy</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-lg font-semibold text-foreground">{topic.problems}</div>
                    <div className="text-xs text-foreground-secondary">Problems</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    
    </div>
  )
}

export default TopicsSection
