import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AVAILABLE_WIDGETS } from '@/hooks/useAnalyticsDashboard'
import { WidgetType } from '@/types'

interface AddWidgetButtonProps {
  availableWidgets: typeof AVAILABLE_WIDGETS
  onAddWidget: (type: WidgetType) => void
}

export function AddWidgetButton({ availableWidgets, onAddWidget }: AddWidgetButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(availableWidgets).map(([type, widget]) => (
          <DropdownMenuItem
            key={type}
            onClick={() => onAddWidget(type as WidgetType)}
            className="gap-2"
          >
            {widget.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}