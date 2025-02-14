import { type RefObject } from "react"
import type { Widget, WidgetType, WidgetSize } from "@/types/analytics"
import { WidgetWrapper } from "./WidgetWrapper"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import type { WidgetSettings } from "@/types/analytics"
import { Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AVAILABLE_WIDGETS } from "@/hooks/useAnalyticsDashboard"

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
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    if (sourceIndex === destinationIndex) return
    const widgetId = result.draggableId
    onMoveWidget(widgetId, destinationIndex)
  }

  const AddWidgetCell = ({ index }: { index: number }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="w-full h-full min-h-[20.25rem] flex flex-col gap-2 rounded-lg"
      >
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
      className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
      style={{ scrollSnapType: "x mandatory", overscrollBehavior: "contain" }}
      onWheel={handleWheel}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="inline-flex gap-6 p-6">
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
                          ${widget.size === "normal" ? "h-[20.25rem] w-[360px]" : ""}
                          ${widget.size === "wide" ? "col-span-2 w-[744px] h-[20.25rem]" : ""}
                          ${widget.size === "tall" ? "row-span-2 w-[360px] h-[42rem]" : ""}
                          ${widget.size === "large" ? "col-span-2 row-span-2 w-[744px] h-[42rem]" : ""}
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
                {[...Array(2)].map((_, i) => (
                  <div key={`add-widget-${i}`} className="h-[20rem] w-[360px]">
                    <AddWidgetCell index={widgets.length + i} />
                  </div>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}