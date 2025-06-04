'use client';

import { useLocalStorage } from '../../../hooks/useLocalStorage';
import {
  Widget,
  WidgetType,
  WidgetSettings,
  WidgetSize,
} from '@/archive/analytics/types/analytics';

export const AVAILABLE_WIDGETS: Record<
  WidgetType,
  {
    title: string;
    description: string;
    icon: string;
    defaultSize: WidgetSize;
  }
> = {
  problemsSolved: {
    title: 'Problems Solved',
    description: 'Track your total solved problems over time',
    icon: 'CheckCircle',
    defaultSize: 'normal',
  },
  studyTime: {
    title: 'Study Time',
    description: 'Monitor your daily/weekly study hours',
    icon: 'Clock',
    defaultSize: 'normal',
  },
  accuracyTrend: {
    title: 'Accuracy Trend',
    description: 'View your answer accuracy over time',
    icon: 'TrendingUp',
    defaultSize: 'wide',
  },
  topicBreakdown: {
    title: 'Topic Breakdown',
    description: 'See performance across different topics',
    icon: 'PieChart',
    defaultSize: 'wide',
  },
  studyStreak: {
    title: 'Study Streak',
    description: 'Track your daily study streak',
    icon: 'Flame',
    defaultSize: 'tall',
  },
  confidenceMatrix: {
    title: 'Confidence Matrix',
    description: 'Compare confidence vs actual performance',
    icon: 'Grid',
    defaultSize: 'large',
  },
  timeDistribution: {
    title: 'Time Distribution',
    description: 'Analyze time spent per problem type',
    icon: 'BarChart',
    defaultSize: 'wide',
  },
  problemDifficulty: {
    title: 'Problem Difficulty',
    description: 'View performance across difficulty levels',
    icon: 'Activity',
    defaultSize: 'normal',
  },
  reviewList: {
    title: 'Review List',
    description: 'List of problems marked for review',
    icon: 'BookMarked',
    defaultSize: 'normal',
  },
  examCountdown: {
    title: 'Exam Countdown',
    description: 'Countdown to your registered exam',
    icon: 'Timer',
    defaultSize: 'normal',
  },
};

const _determineWidgetPlacement = (
  widgets: Widget[],
  size: WidgetSize,
): number => {
  if (size === 'tall' || size === 'large') {
    return 0;
  }

  return widgets.length;
};

export function useAnalyticsDashboard() {
  const [widgets, setWidgets] = useLocalStorage<Widget[]>(
    'analytics-widgets',
    [],
  );

  const addWidget = (type: WidgetType, _row: 'top' | 'bottom') => {
    const defaultSize = AVAILABLE_WIDGETS[type].defaultSize;

    const newWidget: Widget = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      size: defaultSize,
      position: widgets.length,
    };

    const updatedWidgets = [...widgets, newWidget];

    updatedWidgets.forEach((w, index) => {
      w.position = index;
    });

    setWidgets(updatedWidgets);
  };

  const removeWidget = (id: string) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== id);

    updatedWidgets.forEach((w, index) => {
      w.position = index;
    });

    setWidgets(updatedWidgets);
  };

  const moveWidget = (id: string, newPosition: number) => {
    const widgetIndex = widgets.findIndex(w => w.id === id);
    if (widgetIndex === -1) return;

    const sortedWidgets = [...widgets].sort((a, b) => a.position - b.position);

    const [removedWidget] = sortedWidgets.splice(widgetIndex, 1);

    sortedWidgets.splice(newPosition, 0, removedWidget);

    const updatedWidgets = sortedWidgets.map((widget, index) => ({
      ...widget,
      position: index,
    }));

    setWidgets(updatedWidgets);
  };

  const updateWidgetSettings = (id: string, settings: WidgetSettings) => {
    setWidgets(
      widgets.map(widget =>
        widget.id === id ? { ...widget, settings } : widget,
      ),
    );
  };

  const updateWidgetSize = (id: string, size: WidgetSize) => {
    const widgetIndex = widgets.findIndex(w => w.id === id);
    if (widgetIndex === -1) return;

    const updatedWidgets = widgets.map((widget, _index) =>
      widget.id === id ? { ...widget, size } : widget,
    );

    setWidgets(updatedWidgets);
  };

  return {
    widgets,
    availableWidgets: AVAILABLE_WIDGETS,
    addWidget,
    removeWidget,
    moveWidget,
    updateWidgetSettings,
    updateWidgetSize,
  };
}
