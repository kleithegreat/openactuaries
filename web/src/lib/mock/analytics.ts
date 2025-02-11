import { addDays, subDays, format } from 'date-fns'

const today = new Date()

export const MOCK_PROBLEMS_SOLVED = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(today, 29 - i), 'MMM dd'),
  problems: Math.floor(Math.random() * 20) + 5
}))

export const MOCK_STUDY_TIME = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(today, 29 - i), 'MMM dd'),
  hours: Number((Math.random() * 4 + 1).toFixed(1))
}))

export const MOCK_ACCURACY_TREND = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(today, 29 - i), 'MMM dd'),
  accuracy: Math.floor(Math.random() * 30 + 70) // 70-100% accuracy
}))

export const MOCK_TOPIC_BREAKDOWN = [
  { topic: 'Probability', value: 35 },
  { topic: 'Statistics', value: 25 },
  { topic: 'Financial Math', value: 20 },
  { topic: 'Risk Theory', value: 15 },
  { topic: 'Other', value: 5 }
]

export const MOCK_STUDY_STREAK = {
  currentStreak: 7,
  studyDays: Array.from({ length: 14 }, (_, i) => 
    format(subDays(today, i), 'yyyy-MM-dd')
  ).filter(() => Math.random() > 0.3) // Randomly skip some days
}

export const MOCK_CONFIDENCE_MATRIX = [
  [20, 80, 50],  // Very Low confidence
  [30, 70, 100], // Low confidence
  [40, 60, 150], // Medium confidence
  [60, 40, 120], // High confidence
  [70, 30, 80]   // Very High confidence
]

export const MOCK_TIME_DISTRIBUTION = [
  { category: 'Easy', averageTime: 3 },
  { category: 'Medium', averageTime: 5 },
  { category: 'Hard', averageTime: 8 }
]

export const MOCK_PROBLEM_DIFFICULTY = [
  { difficulty: 'Easy', accuracy: 85 },
  { difficulty: 'Medium', accuracy: 70 },
  { difficulty: 'Hard', accuracy: 55 }
]

export const MOCK_REVIEW_LIST = [
  {
    id: '1',
    questionNumber: 15,
    timeSpent: 180,
    isCorrect: false,
    notes: 'Need to review probability concepts'
  },
  {
    id: '2',
    questionNumber: 23,
    timeSpent: 240,
    isCorrect: true,
    notes: 'Good solution but took too long'
  },
  {
    id: '3',
    questionNumber: 8,
    timeSpent: 150,
    isCorrect: false,
    notes: 'Review financial mathematics formulas'
  }
]

export const MOCK_EXAM_INFO = {
  examType: 'P Exam',
  examDate: addDays(today, 45).toISOString()
}