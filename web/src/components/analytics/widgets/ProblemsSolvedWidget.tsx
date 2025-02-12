"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MOCK_PROBLEMS_SOLVED } from "@/lib/mock/analytics"
import { useState } from "react"
import type { WidgetSize } from "@/types/analytics"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const chartConfig = {
  problems: {
    label: "Problems",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ProblemsSolvedWidgetProps {
  settings?: {
    timeRange?: string
  }
  size?: WidgetSize
  onUpdateSettings?: (settings: { timeRange?: string }) => void
}

export function ProblemsSolvedWidget({ settings, size = "normal", onUpdateSettings }: ProblemsSolvedWidgetProps) {
  const [data] = useState(MOCK_PROBLEMS_SOLVED)

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

  return (
    <Card className="w-full h-full">
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0",
          size === "tall" || size === "large" ? "pb-4" : "pb-2",
        )}
      >
        <CardTitle className="text-base font-medium">Problems Solved</CardTitle>
        <Select
          value={settings?.timeRange || "month"}
          onValueChange={(value) => onUpdateSettings?.({ ...settings, timeRange: value })}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue>{settings?.timeRange || "month"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className={cn(getContentHeight(size), "pt-0 px-2 pb-4")}>
        <ChartContainer config={chartConfig} className="!aspect-none h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={getChartMargins(size)}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return format(date, "MMM d")
                }}
                height={30}
                fontSize={12}
                interval="preserveStartEnd"
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
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="problems" stroke="var(--color-problems)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

