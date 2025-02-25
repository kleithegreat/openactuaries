import React from 'react'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, Clock, Award } from 'lucide-react'
import { addDays, format } from 'date-fns'

// Mock data for now
const accuracyData = [
  { date: '1/15', value: 68 },
  { date: '1/22', value: 72 },
  { date: '1/29', value: 70 },
  { date: '2/5', value: 76 },
  { date: '2/12', value: 85 },
  { date: '2/19', value: 82 },
]

const examDate = addDays(new Date(), 45)

const OverviewSection = () => {
  return (
    <div className="space-y-6">
      <div className="bg-background-highlight p-6 rounded-xl border border-border">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold text-foreground">P Exam: {format(examDate, 'MMMM d, yyyy')}</h3>
            <p className="text-foreground-secondary text-sm mb-4">45 days remaining</p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-secondary">Study Progress</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-sm text-foreground-secondary">
                Based on your targeted study plan
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 md:gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">219</div>
              <div className="text-xs text-foreground-secondary">Problems Solved</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">24</div>
              <div className="text-xs text-foreground-secondary">Study Hours</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground">78%</div>
              <div className="text-xs text-foreground-secondary">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background-highlight p-6 rounded-xl border border-border">
          <h3 className="font-serif text-base font-semibold mb-4">Accuracy Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={accuracyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground-secondary))" />
                <YAxis 
                  domain={[50, 100]} 
                  tickFormatter={(value) => `${value}%`}
                  stroke="hsl(var(--foreground-secondary))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background-highlight))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.375rem',
                  }}
                  formatter={(value) => [`${value}%`, 'Accuracy']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-background-highlight p-6 rounded-xl border border-border">
          <h3 className="font-serif text-base font-semibold mb-4">Recent Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { day: 'Mon', problems: 12 },
                  { day: 'Tue', problems: 19 },
                  { day: 'Wed', problems: 5 },
                  { day: 'Thu', problems: 15 },
                  { day: 'Fri', problems: 8 },
                  { day: 'Sat', problems: 22 },
                  { day: 'Sun', problems: 16 },
                ]}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--foreground-secondary))" />
                <YAxis stroke="hsl(var(--foreground-secondary))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background-highlight))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.375rem',
                  }}
                  formatter={(value) => [value, 'Problems']}
                />
                <Bar 
                  dataKey="problems" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-background-highlight p-6 rounded-xl border border-border">
        <h3 className="font-serif text-base font-semibold mb-4">Weekly Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-foreground-secondary text-sm mb-2">Problems Solved</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">97</span>
              <span className="text-success text-sm">+12% from last week</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-foreground-secondary text-sm mb-2">Study Time</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">8.5 hours</span>
              <span className="text-destructive text-sm">-5% from last week</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-foreground-secondary text-sm mb-2">Accuracy</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">82%</span>
              <span className="text-success text-sm">+3% from last week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewSection