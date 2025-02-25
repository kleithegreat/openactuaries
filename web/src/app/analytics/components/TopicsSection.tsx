import React from 'react'
import { PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { TriangleAlert } from 'lucide-react'

// Mock data for demonstration
const topicBreakdown = [
  { name: 'Probability', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Statistics', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Risk Theory', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Financial Math', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 5, color: 'hsl(var(--chart-5))' },
]

const performanceData = [
  { subject: 'Probability', accuracy: 85 },
  { subject: 'Statistics', accuracy: 65 },
  { subject: 'Risk Theory', accuracy: 90 },
  { subject: 'Financial Math', accuracy: 70 },
  { subject: 'Other', accuracy: 75 },
]

const topicsToImprove = [
  { 
    topic: 'Joint Distributions', 
    accuracy: 58, 
    problems: 12,
    description: 'Focus on the concept of covariance and correlation between random variables.' 
  },
  { 
    topic: 'Sampling Distributions', 
    accuracy: 62, 
    problems: 8,
    description: 'Review properties of the t-distribution and chi-square distribution.' 
  },
  { 
    topic: 'Central Limit Theorem', 
    accuracy: 65, 
    problems: 10,
    description: 'Practice applications of CLT in various contexts.' 
  },
]

const TopicsSection = () => {
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
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'hsl(var(--foreground-secondary))', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--foreground-secondary))', fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Radar
                  name="Accuracy"
                  dataKey="accuracy"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.5}
                />
              </RadarChart>
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