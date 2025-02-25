import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Calendar } from '@/components/ui/calendar'

// Mock data for demonstration
const weekdayDistribution = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 1.8 },
  { name: 'Wed', hours: 3.2 },
  { name: 'Thu', hours: 1.5 },
  { name: 'Fri', hours: 1.0 },
  { name: 'Sat', hours: 4.5 },
  { name: 'Sun', hours: 3.8 },
]

// Create random study dates for the calendar
const today = new Date()
const studyDates = []

for (let i = 0; i < 20; i++) {
  const date = new Date()
  date.setDate(today.getDate() - Math.floor(Math.random() * 60))
  studyDates.push(date)
}

const timePerformanceData = [
  { name: 'Morning (5AM-9AM)', value: 78, optimal: true },
  { name: 'Midday (9AM-2PM)', value: 72, optimal: false },
  { name: 'Afternoon (2PM-6PM)', value: 65, optimal: false },
  { name: 'Evening (6PM-10PM)', value: 85, optimal: true },
  { name: 'Night (10PM-1AM)', value: 70, optimal: false },
]

const COLORS = ['#3D9A72', '#AECFC6', '#AECFC6', '#3D9A72', '#AECFC6']

const TimeSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {/* Calendar with streak info */}
      <div className="bg-background-highlight p-4 rounded-xl border border-border xl:col-span-1 flex flex-col h-full">
        <h3 className="font-serif text-base font-semibold mb-3">Study Calendar</h3>
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <Calendar
              mode="multiple"
              selected={studyDates}
              className="rounded-md border bg-background w-full h-full"
            />
          </div>
          <div className="flex mt-2 divide-x divide-border">
            <div className="flex-1 text-center px-2">
              <div className="text-xl font-semibold text-foreground">7</div>
              <div className="text-foreground-secondary text-xs">Current streak</div>
            </div>
            <div className="flex-1 text-center px-2">
              <div className="text-xl font-semibold text-foreground">12</div>
              <div className="text-foreground-secondary text-xs">Longest streak</div>
            </div>
            <div className="flex-1 text-center px-2">
              <div className="text-xl font-semibold text-foreground">18</div>
              <div className="text-foreground-secondary text-xs">Days this month</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Day of week distribution */}
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
      
      {/* Performance by time of day */}
      <div className="bg-background-highlight p-4 rounded-xl border border-border flex flex-col h-full">
        <h3 className="font-serif text-base font-semibold mb-3">Performance by Time of Day</h3>
        <div className="flex-grow w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={timePerformanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {timePerformanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="hsl(var(--background))"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
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
              <Legend 
                verticalAlign="bottom"
                layout="vertical"
                align="right"
                wrapperStyle={{
                  paddingLeft: "10px",
                  fontSize: "12px"
                }}
                formatter={(value, entry) => {
                  const { payload } = entry;
                  return (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
                      {value}: {payload.value}%
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendation */}
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