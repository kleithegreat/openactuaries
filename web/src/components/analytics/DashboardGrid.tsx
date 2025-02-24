import { type RefObject } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { WidgetWrapper } from "./WidgetWrapper"
import { AVAILABLE_WIDGETS } from "@/hooks/useAnalyticsDashboard"
import type { WidgetType, WidgetSize, WidgetSettings } from "@/types/analytics"

interface DashboardGridProps {
  widgets: {
    id: string;
    type: WidgetType;
    size: WidgetSize;
    position: number;
    settings?: WidgetSettings;
  }[]
  onRemoveWidget: (id: string) => void
  onMoveWidget: (id: string, newPosition: number) => void
  onUpdateSettings: (id: string, settings: WidgetSettings) => void
  onAddWidget: (type: WidgetType, index: number) => void
  onUpdateWidgetSize: (id: string, size: WidgetSize) => void
  onScroll: (direction: 'left' | 'right') => void
  gridRef: RefObject<HTMLDivElement | null>
}

const WIDGET_WIDTH = 360;
const WIDGET_HEIGHT = 340;

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
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    
    onMoveWidget(result.draggableId, result.destination.index);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!gridRef.current) return;
    e.preventDefault();
    const direction = e.deltaY > 0 ? 'right' : 'left';
    onScroll(direction);
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.position - b.position);
  
  return (
    <div
      ref={gridRef}
      className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
      style={{ overscrollBehavior: "contain" }}
      onWheel={handleWheel}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-2 w-max" style={{ minWidth: "100%", minHeight: WIDGET_HEIGHT * 2 + 32 }}>
          <Droppable droppableId="dashboard" direction="horizontal" type="WIDGET">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-flow-col auto-rows-[340px] gap-4 grid-rows-2"
                style={{ minHeight: WIDGET_HEIGHT * 2 + 16 }}
              >
                {sortedWidgets.map((widget, index) => (
                  <Draggable 
                    key={widget.id} 
                    draggableId={widget.id} 
                    index={index}
                  >
                    {(provided, snapshot) => {
                      const isWide = widget.size === "wide" || widget.size === "large";
                      const isTall = widget.size === "tall" || widget.size === "large";
                      
                      const width = isWide ? WIDGET_WIDTH * 2 + 16 : WIDGET_WIDTH;
                      const height = isTall ? WIDGET_HEIGHT * 2 + 16 : WIDGET_HEIGHT;
                      
                      return (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          data-grid-item="true"
                          className={`rounded-xl overflow-hidden transition-shadow ${
                            snapshot.isDragging ? 'shadow-xl' : 'shadow'
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                            width: `${width}px`,
                            height: `${height}px`,
                            gridRow: isTall ? "span 2" : "auto",
                            gridColumn: isWide ? "span 2" : "auto",
                            zIndex: snapshot.isDragging ? 100 : 1,
                            transform: snapshot.isDragging 
                              ? `${provided.draggableProps.style?.transform} scale(1.02)` 
                              : provided.draggableProps.style?.transform,
                            opacity: snapshot.isDragging ? 0.9 : 1,
                          }}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="h-full cursor-move"
                          >
                            <WidgetWrapper
                              widget={widget}
                              onRemove={() => onRemoveWidget(widget.id)}
                              onUpdateSettings={(settings) => onUpdateSettings(widget.id, settings)}
                              onUpdateSize={(size) => onUpdateWidgetSize(widget.id, size)}
                            />
                          </div>
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
                
                {/* This placeholder is important for drag/drop to work smoothly */}
                {provided.placeholder}
                
                <div 
                  className="flex items-center justify-center rounded-md" 
                  style={{ 
                    width: WIDGET_WIDTH, 
                    height: WIDGET_HEIGHT,
                    gridRow: "1" 
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-full">
                        <Plus className="h-6 w-6 mr-2" />
                        Add Widget
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {Object.entries(AVAILABLE_WIDGETS).map(([type, info]) => {
                        const widgetType = type as WidgetType;
                        return (
                          <DropdownMenuItem 
                            key={type} 
                            onClick={() => onAddWidget(widgetType, 0)}
                          >
                            {info.title}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div 
                  className="flex items-center justify-center rounded-md" 
                  style={{ 
                    width: WIDGET_WIDTH, 
                    height: WIDGET_HEIGHT,
                    gridRow: "2" 
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-full">
                        <Plus className="h-6 w-6 mr-2" />
                        Add Widget
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {Object.entries(AVAILABLE_WIDGETS).map(([type, info]) => {
                        const widgetType = type as WidgetType;
                        return (
                          <DropdownMenuItem 
                            key={type} 
                            onClick={() => onAddWidget(widgetType, 1)}
                          >
                            {info.title}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}