"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, GripHorizontal, Maximize2 } from "lucide-react"
import type { Widget, WidgetSettings, WidgetSize } from "@/types/analytics"
import * as Widgets from "./widgets"
import { DeleteWidgetDialog } from "./DeleteWidgetDialog"
import { AVAILABLE_WIDGETS } from "@/hooks/useAnalyticsDashboard"
import { ErrorBoundary } from "react-error-boundary"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function WidgetErrorFallback({ error }: { error: Error }) {
  return <div className="p-4 text-red-500">Widget Error: {error.message}</div>
}

interface WidgetWrapperProps {
  widget: Widget
  onRemove: () => void
  onUpdateSettings: (settings: WidgetSettings) => void
  onUpdateSize: (size: WidgetSize) => void
}

export function WidgetWrapper({ widget, onRemove, onUpdateSettings, onUpdateSize }: WidgetWrapperProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const widgetName = `${widget.type.charAt(0).toUpperCase()}${widget.type.slice(1)}Widget`
  const WidgetComponent = Widgets[widgetName as keyof typeof Widgets]

  if (!WidgetComponent) return null

  return (
    <div className="relative group h-full">
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Maximize2 className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[
              { value: "normal" as const, label: "Normal" },
              { value: "wide" as const, label: "Wide" },
              { value: "tall" as const, label: "Tall" },
              { value: "large" as const, label: "Large" },
            ].map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => onUpdateSize(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowDeleteDialog(true)}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <GripHorizontal className="h-3 w-3 text-gray-400 cursor-move" />
      </div>
      
      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <WidgetComponent
          settings={widget.settings}
          size={widget.size}
          onUpdateSettings={(settings) => {
            onUpdateSettings(settings);
          }}
        />
      </ErrorBoundary>

      <DeleteWidgetDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          setShowDeleteDialog(false)
          onRemove()
        }}
        widgetTitle={AVAILABLE_WIDGETS[widget.type].title}
      />
    </div>
  )
}
