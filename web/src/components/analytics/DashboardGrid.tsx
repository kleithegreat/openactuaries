"use client"

import { useRef, useState } from "react"
import type { Widget, WidgetType, WidgetSize } from "@/types/analytics"
import { WidgetWrapper } from "./WidgetWrapper"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import type { WidgetSettings } from "@/types/analytics"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AVAILABLE_WIDGETS } from "@/hooks/useAnalyticsDashboard"

interface DashboardGridProps {
  widgets: Widget[]
  onRemoveWidget: (id: string) => void
  onMoveWidget: (id: string, newPosition: number) => void
  onUpdateSettings: (id: string, settings: WidgetSettings) => void
  onAddWidget: (type: WidgetType, row: "top" | "bottom") => void
  onUpdateWidgetSize: (id: string, size: WidgetSize) => void
}

export function DashboardGrid({
  widgets,
  onRemoveWidget,
  onMoveWidget,
  onUpdateSettings,
  onAddWidget,
  onUpdateWidgetSize,
}: DashboardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const getColumnCount = (widgets: Widget[]) => {
    return widgets.reduce((acc, widget) => {
      return acc + (widget.size === "wide" || widget.size === "large" ? 2 : 1)
    }, 0)
  }
  const totalColumns = getColumnCount(widgets) + 1

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    if (sourceIndex === destinationIndex) return
    const widgetId = result.draggableId
    onMoveWidget(widgetId, destinationIndex)
  }

  const scrollLeft = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: -384, behavior: "smooth" })
      setScrollPosition((prev) => Math.max(0, prev - 1))
    }
  }

  const scrollRight = () => {
    if (gridRef.current) {
      gridRef.current.scrollBy({ left: 384, behavior: "smooth" })
      setScrollPosition((prev) => Math.min(prev + 1, totalColumns - 3))
    }
  }

  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < totalColumns - 3

  const AddWidgetCell = ({ row }: { row: "top" | "bottom" }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full h-full min-h-[20rem] flex flex-col gap-2">
          <Plus className="h-6 w-6" />
          Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(AVAILABLE_WIDGETS).map(([type, info]) => {
          const widgetType = type as WidgetType
          // Skip tall/large widgets in bottom row
          if (row === "bottom" && (widgetType === "studyStreak" || widgetType === "confidenceMatrix")) {
            return null
          }
          return (
            <DropdownMenuItem key={type} onClick={() => onAddWidget(widgetType, row)}>
              {info.title}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="relative w-full">
      {/* Navigation buttons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="rounded-full shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="rounded-full shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Main grid container */}
      <div
        ref={gridRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard" direction="horizontal">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="inline-flex gap-6 p-6">
                {/* Widget grid */}
                <div className="grid grid-rows-2 grid-flow-col gap-6 auto-cols-[360px] h-[42rem]">
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            overflow-hidden
                            ${widget.size === "normal" ? "h-[20rem] w-[360px]" : ""}
                            ${widget.size === "wide" ? "col-span-2 w-[744px] h-[20rem]" : ""}
                            ${widget.size === "tall" ? "row-span-2 w-[360px] h-[41rem]" : ""}
                            ${widget.size === "large" ? "col-span-2 row-span-2 w-[744px] h-[41rem]" : ""}
                          `}
                          style={{ ...provided.draggableProps.style }}
                        >
                          <WidgetWrapper
                            widget={widget}
                            onRemove={() => onRemoveWidget(widget.id)}
                            onUpdateSettings={(settings) => onUpdateSettings(widget.id, settings)}
                            onUpdateSize={(size) => onUpdateWidgetSize(widget.id, size)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {/* Add Widget cells */}
                  <div className="h-[20rem] w-[360px]">
                    <AddWidgetCell row="top" />
                  </div>
                  <div className="h-[20rem] w-[360px]">
                    <AddWidgetCell row="bottom" />
                  </div>
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}