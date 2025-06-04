'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Book, BarChart4, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewSection from './components/OverviewSection';
import TopicsSection from './components/TopicsSection';
import TimeSection from './components/TimeSection';
import HistorySection from './components/HistorySection';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-foreground-secondary mt-1">
              Track your progress and identify areas for improvement
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-background-secondary h-12 p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BarChart4 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="topics"
              className="flex items-center gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Book className="h-4 w-4" />
              <span>Topics</span>
            </TabsTrigger>
            <TabsTrigger
              value="time"
              className="flex items-center gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4" />
              <span>Study Time</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <OverviewSection />
          </TabsContent>

          <TabsContent value="topics" className="mt-0">
            <TopicsSection />
          </TabsContent>

          <TabsContent value="time" className="mt-0">
            <TimeSection />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <HistorySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
