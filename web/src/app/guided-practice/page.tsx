"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import PracticeProblem from './components/PracticeProblem'
import SessionSummary from './components/SessionSummary'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Problem, Answer } from './types'

export default function GuidedPracticePage() {
  const router = useRouter()
  const [sessionState, setSessionState] = useState<'loading' | 'selecting' | 'active' | 'summary' | 'error'>('loading')
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0)
  const [problems, setProblems] = useState<Problem[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userExams, setUserExams] = useState<string[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const searchParams = useSearchParams()
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) throw new Error('Failed to fetch user profile')
        
        const data = await response.json()
        
        const exams = data.examRegistrations?.map((reg: { examType: string }) => reg.examType) || []
        setUserExams(exams)
        
        if (exams.length === 0) {
          setError("You don't have any exams registered. Please set up your profile first.")
          setSessionState('error')
          setLoading(false)
          return
        }
        
        const examParam = searchParams.get('exam')

        if (examParam && exams.includes(examParam)) {
          setSelectedExam(examParam)
          startSession(examParam)
        } else if (exams.length === 1) {
          setSelectedExam(exams[0])
          startSession(exams[0])
        } else {
          setSessionState('selecting')
          setLoading(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data')
        setSessionState('error')
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [searchParams])
  
  const startSession = async (examType: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const profileResponse = await fetch('/api/profile')
      if (!profileResponse.ok) throw new Error('Failed to fetch user profile')
      
      const profileData = await profileResponse.json()
      const problemCount = profileData.goalType === 'PROBLEMS' ? profileData.goalAmount : 10
      
      const response = await fetch('/api/practice/recommended', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examType,
          problemCount,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch problems')
      }
      
      const data = await response.json()
      setProblems(data)
      setSessionState('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setSessionState('error')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAnswer = (problemId: string, answer: string, isCorrect: boolean, timeSpent: number) => {
    setAnswers([...answers, {
      problemId,
      answer,
      isCorrect,
      timeSpent
    }])
    
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1)
    } else {
      saveSession()
    }
  }
  
  const saveSession = async () => {
    setLoading(true)
    try {
      await fetch('/api/practice/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problems,
          answers
        }),
      })
      
      setSessionState('summary')
    } catch (err) {
      console.error('Error saving session:', err)
      setSessionState('summary')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading && sessionState === 'loading') {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading your practice session...</p>
        </div>
      </div>
    )
  }
  
  if (sessionState === 'error') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/home">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Guided Practice</h1>
            </div>
          </div>
          
          <div className="bg-background-highlight p-6 rounded-xl border border-border">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Error: {error}</p>
              <Button onClick={() => router.push('/setup')}>
                Update Your Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (sessionState === 'selecting') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/home">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Guided Practice</h1>
              <p className="text-foreground-secondary mt-1">
                Smart, personalized practice tailored to your needs
              </p>
            </div>
          </div>
          
          <div className="bg-background-highlight p-6 rounded-xl border border-border">
            <h2 className="text-xl font-semibold mb-4">Which exam would you like to study for?</h2>
            <div className="flex gap-4 items-center">
              <Select
                value={selectedExam}
                onValueChange={setSelectedExam}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {userExams.map(exam => (
                    <SelectItem key={exam} value={exam}>Exam {exam}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => startSession(selectedExam)}
                disabled={!selectedExam}
              >
                Start Practice
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guided Practice - Exam {selectedExam}</h1>
            <p className="text-foreground-secondary mt-1">
              Smart, personalized practice tailored to your needs
            </p>
          </div>
        </div>
        
        {/* Active session */}
        {sessionState === 'active' && problems.length > 0 && (
          <div className="space-y-6 w-full">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-foreground-secondary text-sm">Problem</span>
                <div className="font-semibold">{currentProblemIndex + 1} of {problems.length}</div>
              </div>
              
              <Progress 
                value={(currentProblemIndex / problems.length) * 100} 
                className="w-56 h-2" 
              />
              
              <div className="text-right">
                <span className="text-foreground-secondary text-sm">Session Score</span>
                <div className="font-semibold">
                  {answers.filter(a => a.isCorrect).length} / {answers.length}
                </div>
              </div>
            </div>
            
            {problems[currentProblemIndex] && (
              <PracticeProblem 
                problem={problems[currentProblemIndex]}
                onAnswer={handleAnswer}
              />
            )}
          </div>
        )}
        
        {/* Session summary */}
        {sessionState === 'summary' && (
          <SessionSummary 
            problems={problems}
            answers={answers}
            onNewSession={() => {
              setCurrentProblemIndex(0)
              setAnswers([])
              setProblems([])
              startSession(selectedExam)
            }}
          />
        )}
      </div>
    </div>
  )
}