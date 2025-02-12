"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardGrid } from "@/components/analytics/DashboardGrid"
import { useAnalyticsDashboard } from "@/hooks/useAnalyticsDashboard"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Widget, WidgetType } from "@/types/analytics"

const COLUMN_WIDTH = 384 // 360px width + 24px gap

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)
  
  const {
    widgets,
    addWidget: addWidgetOriginal,
    removeWidget,
    moveWidget,
    updateWidgetSettings,
    updateWidgetSize,
  } = useAnalyticsDashboard()

  const getColumnCount = (widgets: Widget[]) => {
    return widgets.reduce((acc, widget) => {
      return acc + (widget.size === "wide" || widget.size === "large" ? 2 : 1)
    }, 0)
  }
  const totalColumns = getColumnCount(widgets) + 2 // +2 for the "Add Widget" cells

  const handleScroll = (direction: 'left' | 'right') => {
    if (!gridRef.current) return

    const currentPosition = Math.round(gridRef.current.scrollLeft / COLUMN_WIDTH)
    const visibleColumns = Math.floor(gridRef.current.clientWidth / COLUMN_WIDTH)
    const newPosition = direction === 'left' 
      ? Math.max(0, currentPosition - 1)
      : Math.min(currentPosition + 1, totalColumns - visibleColumns)

    gridRef.current.scrollTo({ 
      left: newPosition * COLUMN_WIDTH,
      behavior: 'smooth'
    })

    setScrollPosition(newPosition)
  }

  // Add scroll event listener to keep track of scroll position
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const handleScrollEvent = () => {
      const newPosition = Math.round(grid.scrollLeft / COLUMN_WIDTH)
      setScrollPosition(newPosition)
    }

    // Initial scroll position
    grid.scrollTo({
      left: 0,
      behavior: 'smooth'
    })

    grid.addEventListener('scroll', handleScrollEvent)
    return () => grid.removeEventListener('scroll', handleScrollEvent)
  }, [])

  // Reset scroll position when widgets change
  useEffect(() => {
    if (!gridRef.current) return
    gridRef.current.scrollTo({
      left: 0,
      behavior: 'smooth'
    })
    setScrollPosition(0)
  }, [widgets.length])

  const addWidget = (type: WidgetType, index: number) => {
    addWidgetOriginal(type, index === 0 ? 'top' : 'bottom')
  }

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

  const visibleColumns = gridRef.current ? Math.floor(gridRef.current.clientWidth / COLUMN_WIDTH) : 3
  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < totalColumns - visibleColumns

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

        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className="rounded-full shadow-lg shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="border rounded-lg bg-white shadow-sm flex-1 overflow-hidden">
            <DashboardGrid
              widgets={widgets}
              onRemoveWidget={removeWidget}
              onMoveWidget={moveWidget}
              onUpdateSettings={updateWidgetSettings}
              onAddWidget={addWidget}
              onUpdateWidgetSize={updateWidgetSize}
              onScroll={handleScroll}
              gridRef={gridRef}
            />
          </div>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className="rounded-full shadow-lg shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}