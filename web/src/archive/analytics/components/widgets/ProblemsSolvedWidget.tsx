"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MOCK_PROBLEMS_SOLVED } from "@/lib/mock/analytics"
import { useState, useEffect } from "react"
import type { WidgetSize } from "@/archive/analytics/types/analytics"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

const chartConfig = {
  problems: {
    label: "Problems",
    color: "#0c4a6e",
  },
} satisfies ChartConfig

import type { TimeRangeOption, WidgetSettings } from "@/archive/analytics/types/analytics"

interface ProblemsSolvedWidgetProps {
  settings?: WidgetSettings
  size?: WidgetSize
  onUpdateSettings?: (settings: WidgetSettings) => void
}

export function ProblemsSolvedWidget({ settings, size = "normal", onUpdateSettings }: ProblemsSolvedWidgetProps) {
  const [displayData, setDisplayData] = useState(MOCK_PROBLEMS_SOLVED)
  const timeRange = settings?.timeRange || "month" as TimeRangeOption

  useEffect(() => {
    switch (timeRange) {
      case "week":
        setDisplayData(MOCK_PROBLEMS_SOLVED.slice(-7))
        break
        
      case "6months": {
        const last180Days = MOCK_PROBLEMS_SOLVED.slice(-180)
        
        const weeklyData = []
        for (let i = 0; i < last180Days.length; i += 7) {
          const weekChunk = last180Days.slice(i, i + 7)
          const weekStart = weekChunk[0].date
          const avgProblems = Math.round(
            weekChunk.reduce((sum, day) => sum + day.problems, 0) / weekChunk.length
          )
          
          weeklyData.push({
            date: weekStart,
            dateFormatted: format(parseISO(weekStart), 'MMM d, yyyy'),
            problems: avgProblems,
            trend: 0, // ?
            originalData: weekChunk
          })
        }
        
        setDisplayData(weeklyData)
        break
      }
        
      case "month":
      default:
        setDisplayData(MOCK_PROBLEMS_SOLVED.slice(-30))
        break
    }
  }, [timeRange])

  const getChartMargins = (size: WidgetSize) => {
    switch (size) {
      case "wide":
        return { left: 0, right: 16, top: 8, bottom: 32 }
      case "tall":
        return { left: 0, right: 16, top: 16, bottom: 32 }
      case "large":
        return { left: 0, right: 16, top: 16, bottom: 32 }
      default:
        return { left: 0, right: 16, top: 8, bottom: 32 }
    }
  }

  const getContentHeight = (size: WidgetSize) => {
    switch (size) {
      case "tall":
      case "large":
        return "h-[calc(100%-4rem)]"
      default:
        return "h-[calc(100%-3.5rem)]"
    }
  }

  const formatDateForAxis = (dateStr: string) => {
    const date = parseISO(dateStr)
    
    switch (timeRange) {
      case "week":
        return format(date, "EEE")
      case "6months":
        return format(date, "MMM d")
      case "month":
      default:
        return format(date, "MMM d")
    }
  }

  const getXAxisInterval = () => {
    switch (timeRange) {
      case "week":
        return 0
      case "6months":
        return 1
      case "month":
      default:
        return Math.ceil(displayData.length / 5)
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 pt-4",
          size === "tall" || size === "large" ? "pb-4" : "pb-2",
        )}
      >
        <CardTitle className="text-base font-medium">Problems Solved</CardTitle>
        <Select
          value={timeRange}
          onValueChange={(value: TimeRangeOption) => onUpdateSettings?.({ ...settings, timeRange: value })}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue>{getTimeRangeDisplay(timeRange)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className={cn(getContentHeight(size), "pt-0 px-2 pb-4")}>
        <ChartContainer config={chartConfig} className="!aspect-none h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={getChartMargins(size)}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={formatDateForAxis}
                height={30}
                fontSize={12}
                interval={getXAxisInterval()}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                fontSize={12}
                domain={[0, "auto"]}
                padding={{ top: 8, bottom: 8 }}
              />
              <ChartTooltip 
                cursor={false} 
                content={(props) => {
                  if (!props.active || !props.payload || !props.payload[0]) {
                    return null
                  }
                  
                  const data = props.payload[0].payload
                  const date = parseISO(data.date)
                  
                  if (timeRange === "6months" && data.originalData) {
                    const weekStart = format(date, "MMM d")
                    const weekEnd = format(
                      parseISO(data.originalData[data.originalData.length - 1]?.date || data.date), 
                      "MMM d, yyyy"
                    )
                    
                    return (
                      <div className="bg-white p-2 rounded shadow border text-xs">
                        <div className="font-medium mb-1">Week of {weekStart} - {weekEnd}</div>
                        <div className="text-sm">
                          <span className="font-medium text-sky-900">
                            {data.problems} problems
                          </span>
                          <span className="text-gray-500 ml-1">avg/day</span>
                        </div>
                      </div>
                    )
                  }
                  
                  return (
                    <ChartTooltipContent
                      active={props.active}
                      payload={props.payload}
                      labelFormatter={(label) => {
                        if (typeof label === 'string' && label.includes(',')) {
                          return label;
                        }
                        return format(parseISO(data.date), "MMM d, yyyy");
                      }}
                    />
                  )
                }}
              />
              <Line 
                type="monotone" 
                dataKey="problems" 
                stroke="var(--color-problems)" 
                strokeWidth={2} 
                dot={timeRange === "6months"}
                activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function getTimeRangeDisplay(timeRange: TimeRangeOption): string {
  switch (timeRange) {
    case "week":
      return "Week"
    case "6months":
      return "6 Months"
    case "day":
      return "Day"
    case "year":
      return "Year"
    case "month":
    default:
      return "Month"
  }
}