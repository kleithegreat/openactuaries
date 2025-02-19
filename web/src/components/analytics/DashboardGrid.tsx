import { type RefObject } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { WidgetWrapper } from "./WidgetWrapper"
import { AVAILABLE_WIDGETS } from "@/hooks/useAnalyticsDashboard"
import type { Widget, WidgetType, WidgetSize, WidgetSettings } from "@/types/analytics"

interface DashboardGridProps {
  widgets: Widget[]
  onRemoveWidget: (id: string) => void
  onMoveWidget: (id: string, newPosition: number) => void
  onUpdateSettings: (id: string, settings: WidgetSettings) => void
  onAddWidget: (type: WidgetType, index: number) => void
  onUpdateWidgetSize: (id: string, size: WidgetSize) => void
  onScroll: (direction: 'left' | 'right') => void
  gridRef: RefObject<HTMLDivElement | null>
}

export function DashboardGrid({
  widgets,
  onRemoveWidget,
  onMoveWidget,
  onUpdateSettings,
  onAddWidget,
  onUpdateWidgetSize,
  onScroll,
  gridRef,
}: DashboardGridProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return
    onMoveWidget(result.draggableId, result.destination.index)
  }

  const AddWidgetCell = ({ index }: { index: number }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full h-full">
          <Plus className="h-6 w-6" />
          Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(AVAILABLE_WIDGETS).map(([type, info]) => {
          const widgetType = type as WidgetType
          return (
            <DropdownMenuItem key={type} onClick={() => onAddWidget(widgetType, index)}>
              {info.title}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const handleWheel = (e: React.WheelEvent) => {
    if (!gridRef.current) return
    e.preventDefault()
    const direction = e.deltaY > 0 ? 'right' : 'left'
    onScroll(direction)
  }

  return (
    <div
      ref={gridRef}
      className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
      style={{ scrollSnapType: "x mandatory", overscrollBehavior: "contain" }}
      onWheel={handleWheel}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-flow-col gap-4"
              style={{
                gridTemplateRows: "20.5rem 20.5rem",
                height: "42rem",
                gridAutoColumns: "360px",
              }}
            >
              {widgets.map((widget, index) => {
                const colSpan = (widget.size === "wide" || widget.size === "large") ? 2 : 1
                const rowSpan = (widget.size === "tall" || widget.size === "large") ? 2 : 1

                return (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`col-span-${colSpan} row-span-${rowSpan} w-full h-full rounded-md overflow-hidden`}
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
                )
              })}

              {[...Array(2)].map((_, i) => (
                <div
                  key={`add-widget-${i}`}
                  className="col-span-1 row-span-1 w-full h-full overflow-hidden rounded-md"
                >
                  <AddWidgetCell index={widgets.length + i} />
                </div>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}