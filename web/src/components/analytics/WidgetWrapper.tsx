import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, GripHorizontal } from 'lucide-react'
import { Widget, WidgetSettings } from '@/types/analytics'
import * as Widgets from './widgets'
import { DeleteWidgetDialog } from './DeleteWidgetDialog'
import { AVAILABLE_WIDGETS } from '@/hooks/useAnalyticsDashboard'
import { ErrorBoundary } from 'react-error-boundary'

function WidgetErrorFallback({ error }) {
  return <div className="p-4 text-red-500">Widget Error: {error.message}</div>
}

interface WidgetWrapperProps {
  widget: Widget
  onRemove: () => void
  onUpdateSettings: (settings: WidgetSettings) => void
}

interface WidgetComponentProps {
  settings?: WidgetSettings
  onUpdateSettings: (settings: WidgetSettings) => void
}

export function WidgetWrapper({ widget, onRemove, onUpdateSettings }: WidgetWrapperProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const widgetName = `${widget.type.charAt(0).toUpperCase()}${widget.type.slice(1)}Widget`
  const WidgetComponent = Widgets[widgetName as keyof typeof Widgets] as React.ComponentType<WidgetComponentProps>
  const widgetInfo = AVAILABLE_WIDGETS[widget.type]

  if (!WidgetComponent) {
    return null
  }

  const handleDelete = () => {
    setShowDeleteDialog(false)
    onRemove()
  }

  return (
    <>
      <Card className="relative group h-full">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowDeleteDialog(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <GripHorizontal className="h-4 w-4 text-gray-400 cursor-move" />
        </div>
        <div className="h-full">
          <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
            <WidgetComponent settings={widget.settings} onUpdateSettings={onUpdateSettings} />
          </ErrorBoundary>
        </div>
      </Card>

      <DeleteWidgetDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        widgetTitle={widgetInfo.title}
      />
    </>
  )
}