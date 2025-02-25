"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardGrid } from "@/components/analytics/DashboardGrid"
import { useAnalyticsDashboard } from "@/hooks/useAnalyticsDashboard"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { WidgetType } from "@/types/analytics"

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

  const getContentWidth = () => {
    if (!gridRef.current) return 0;
    const containerWidth = gridRef.current.clientWidth;
    const scrollWidth = gridRef.current.scrollWidth;
    return scrollWidth - containerWidth;
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!gridRef.current) return;

    const scrollAmount = 376; // 360px (widget) + 16px (gap)
    const currentScroll = gridRef.current.scrollLeft;
    const targetScroll = direction === "left" 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;

    gridRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleScrollEvent = () => {
      setScrollPosition(grid.scrollLeft);
    };

    grid.addEventListener("scroll", handleScrollEvent);
    return () => grid.removeEventListener("scroll", handleScrollEvent);
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    gridRef.current.scrollTo({ left: 0, behavior: "smooth" });
    setScrollPosition(0);
  }, [widgets.length]);

  const addWidget = (type: WidgetType, rowIndex: number) => {
    addWidgetOriginal(type, rowIndex === 0 ? "top" : "bottom");
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text">My Analytics</h1>
          <p className="text-foreground-muted mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // const containerWidth = gridRef.current?.clientWidth || 0;
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < getContentWidth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text">My Analytics</h1>
            <p className="text-foreground-muted mt-2">
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
          
          <div className="border rounded-lg shadow-sm overflow-hidden p-4 w-full">
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
  );
}