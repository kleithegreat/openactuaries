"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardGrid } from "@/components/analytics/DashboardGrid"
import { useAnalyticsDashboard } from "@/hooks/useAnalyticsDashboard"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Widget, WidgetType } from "@/types/analytics"

// const CONTAINER_WIDTH = 1112

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

  /**
   * Count how many columns we have total.
   * Normal widgets = 1 col, wide/large = 2 cols, plus 2 "Add Widget" cells.
   */
  const getColumnCount = (widgets: Widget[]) => {
    return widgets.reduce((acc, w) => {
      return acc + (w.size === "wide" || w.size === "large" ? 2 : 1)
    }, 0)
  }
  const totalColumns = getColumnCount(widgets) + 2

  const handleScroll = (direction: "left" | "right") => {
    if (!gridRef.current) return

    // Each "column" (including the gap) is ~376px or so,
    // but we can measure it exactly or just use 360+16.
    const columnPlusGap = 376 // Approx. 360 + (16 / # columns). Adjust as needed.

    const currentPosition = Math.round(gridRef.current.scrollLeft / columnPlusGap)
    const visibleColumns = 3 // We always show exactly 3 columns in the container
    const newPosition =
      direction === "left"
        ? Math.max(0, currentPosition - 1)
        : Math.min(currentPosition + 1, totalColumns - visibleColumns)

    gridRef.current.scrollTo({
      left: newPosition * columnPlusGap,
      behavior: "smooth",
    })
    setScrollPosition(newPosition)
  }

  // Track scroll position to disable left/right buttons
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const handleScrollEvent = () => {
      // Approx. measure how many columns we've scrolled
      const columnPlusGap = 376
      const newPosition = Math.round(grid.scrollLeft / columnPlusGap)
      setScrollPosition(newPosition)
    }

    grid.scrollTo({ left: 0 })
    grid.addEventListener("scroll", handleScrollEvent)
    return () => grid.removeEventListener("scroll", handleScrollEvent)
  }, [])

  // Reset scroll when widget count changes
  useEffect(() => {
    if (!gridRef.current) return
    gridRef.current.scrollTo({ left: 0, behavior: "smooth" })
    setScrollPosition(0)
  }, [widgets.length])

  // Example: top row if index===0, else bottom
  const addWidget = (type: WidgetType, index: number) => {
    addWidgetOriginal(type, index === 0 ? "top" : "bottom")
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

  // We only show 3 columns at once
  const visibleColumns = 3
  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < totalColumns - visibleColumns

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="rounded-full shadow-lg shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="border rounded-lg bg-white shadow-sm overflow-hidden p-4">
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
            onClick={() => handleScroll("right")}
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