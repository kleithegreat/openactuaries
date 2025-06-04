export type WidgetType =
  | 'problemsSolved'
  | 'studyTime'
  | 'accuracyTrend'
  | 'topicBreakdown'
  | 'studyStreak'
  | 'confidenceMatrix'
  | 'timeDistribution'
  | 'problemDifficulty'
  | 'reviewList'
  | 'examCountdown';

export type WidgetSize = 'normal' | 'wide' | 'tall' | 'large';

export type TimeRangeOption = 'week' | 'month' | '6months' | 'day' | 'year';

export interface WidgetSettings {
  timeRange?: TimeRangeOption;
  displayType?: 'chart' | 'numbers';
  showLabels?: boolean;
  colorScheme?: string;
  limit?: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  position: number;
  size: WidgetSize;
  settings?: WidgetSettings;
}

export interface ExamInfo {
  examType: string;
  examDate: string;
}

export interface Problem {
  id: string;
  questionNumber: number;
  timeSpent: number;
  isCorrect: boolean;
  notes?: string;
}

export interface StudySession {
  date: string;
  hours: number;
}
