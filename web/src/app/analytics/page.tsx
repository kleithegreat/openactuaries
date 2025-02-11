'use client'

import React, { useEffect, useState } from 'react'
import { DashboardGrid } from '@/components/analytics/DashboardGrid'
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false)
  const { 
    widgets,
    addWidget,
    removeWidget,
    moveWidget,
    updateWidgetSettings
  } = useAnalyticsDashboard()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">My Analytics</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Analytics</h1>
            <p className="text-gray-600 mt-2">
              Customize your analytics view by adding, removing, and rearranging widgets
            </p>
          </div>
        </div>

        <div className="border rounded-lg bg-white shadow-sm">
          <div className="h-[44rem]">
            <DashboardGrid
              widgets={widgets}
              onRemoveWidget={removeWidget}
              onMoveWidget={moveWidget}
              onUpdateSettings={updateWidgetSettings}
              onAddWidget={addWidget}
            />
          </div>
        </div>
      </div>
    </div>
  )
}