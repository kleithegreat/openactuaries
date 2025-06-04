'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { MOCK_STUDY_TIME } from '@/lib/mock/analytics';
import { WidgetSettings } from '@/archive/analytics/types/analytics';
import { cn } from '@/lib/utils';

interface StudyTimeWidgetProps {
  settings?: WidgetSettings;
  size?: 'normal' | 'wide' | 'tall' | 'large';
  onUpdateSettings?: (settings: WidgetSettings) => void;
}

export function StudyTimeWidget({
  settings,
  size = 'normal',
  onUpdateSettings,
}: StudyTimeWidgetProps) {
  const [data, _setData] = useState(MOCK_STUDY_TIME);
  const displayType = (settings?.displayType ?? 'chart') as 'chart' | 'numbers';

  const chartConfig = {
    hours: {
      label: 'Study Hours',
      color: '#0c4a6e',
    },
  } satisfies ChartConfig;

  const getChartMargins = () => {
    switch (size) {
      case 'wide':
        return { left: 0, right: 16, top: 8, bottom: 0 };
      case 'tall':
        return { left: 0, right: 16, top: 16, bottom: 0 };
      case 'large':
        return { left: 0, right: 16, top: 16, bottom: 0 };
      default:
        return { left: 0, right: 16, top: 8, bottom: 0 };
    }
  };

  const getContentHeight = () => {
    switch (size) {
      case 'tall':
      case 'large':
        return 'h-[calc(100%-4rem)]';
      default:
        return 'h-[calc(100%-3.5rem)]';
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between space-y-0 pt-4',
          size === 'tall' || size === 'large' ? 'pb-4' : 'pb-2',
        )}
      >
        <CardTitle className="text-base font-medium">Study Time</CardTitle>
        <Select
          value={displayType}
          onValueChange={value => {
            onUpdateSettings?.({
              ...settings,
              displayType: value as 'chart' | 'numbers',
            });
          }}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue>{displayType}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chart">Chart</SelectItem>
            <SelectItem value="numbers">Numbers</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className={cn(getContentHeight(), 'pt-0 px-2 pb-4')}>
        {displayType === 'chart' ? (
          <ChartContainer
            config={chartConfig}
            className="!aspect-none h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={getChartMargins()}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  height={30}
                  fontSize={12}
                  interval={Math.ceil(data.length / 5)}
                  tickFormatter={dateStr => {
                    const date = new Date(dateStr);
                    return `Jan ${date.getDate()}`;
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                  fontSize={12}
                  tickFormatter={(value: number) => `${value}h`}
                  domain={[0, 'auto']}
                  padding={{ top: 8, bottom: 0 }}
                />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={props => {
                    if (!props.active || !props.payload || !props.payload[0]) {
                      return null;
                    }

                    const data = props.payload[0].payload;

                    return (
                      <ChartTooltipContent
                        active={props.active}
                        payload={props.payload}
                        labelFormatter={() => data.dateFormatted}
                      />
                    );
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="var(--color-hours)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4 h-full">
            <div className="text-center flex flex-col justify-center items-center">
              <div className="text-2xl font-bold text-primary">
                {data.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center flex flex-col justify-center items-center">
              <div className="text-2xl font-bold text-primary">
                {(
                  data.reduce((acc, d) => acc + d.hours, 0) / data.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                Average Daily Hours
              </div>
            </div>
            <div className="text-center flex flex-col justify-center items-center">
              <div className="text-2xl font-bold text-primary">
                {Math.max(...data.map(d => d.hours)).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Most Hours</div>
            </div>
            <div className="text-center flex flex-col justify-center items-center">
              <div className="text-2xl font-bold text-primary">
                {Math.min(...data.map(d => d.hours)).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Least Hours</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
