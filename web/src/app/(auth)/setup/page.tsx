'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { AnimatedAlert } from '@/components/ui/AnimatedAlert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, Target, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTemporaryState } from '@/hooks/useTemporaryState'

export default function SetupPage() {
  const { status } = useSession()
  const router = useRouter()
  
  const [goalType, setGoalType] = useState('PROBLEMS')
  const [goalAmount, setGoalAmount] = useState('')
  const [selectedExams, setSelectedExams] = useState<{
    exam: string;
    date: Date | undefined;
  }[]>([{ exam: '', date: undefined }])
  const [error, setError] = useTemporaryState('', 5000)
  const [success, setSuccess] = useTemporaryState(false, 2000)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.goalType) setGoalType(data.goalType)
          if (data.goalAmount) setGoalAmount(data.goalAmount.toString())
          if (data.examRegistrations?.length > 0) {
            setSelectedExams(data.examRegistrations.map((reg: { examType: string; examDate: string }) => ({
              exam: reg.examType,
              date: new Date(reg.examDate)
            })))
          }
        })
        .catch(err => console.error('Error fetching profile:', err))
    }
  }, [status, router])

  const validateForm = () => {
    if (!goalAmount) {
      setError('Please set a daily goal amount')
      return false
    }

    const hasIncompleteExam = selectedExams.some(exam => !exam.exam || !exam.date)
    if (hasIncompleteExam) {
      setError('Please complete all exam information. Even if you haven\'t registered yet, setting a target date helps us personalize your training.')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
  
    try {
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalType,
          goalAmount: parseInt(goalAmount),
          examRegistrations: selectedExams.map(exam => ({
            ...exam,
            date: exam.date?.toISOString()
          }))
        }),
      })
  
      if (!response.ok) throw new Error('Failed to save settings')
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  const addExam = () => {
    setSelectedExams([...selectedExams, { exam: '', date: undefined }])
  }

  const removeExam = (index: number) => {
    if (selectedExams.length > 1) {
      setSelectedExams(selectedExams.filter((_, i) => i !== index))
    }
  }

  const updateExam = (index: number, field: 'exam' | 'date', value: string | Date | undefined) => {
    const newExams = [...selectedExams]
    newExams[index] = { ...newExams[index], [field]: value }
    setSelectedExams(newExams)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let&apos;s Customize Your Study Plan
          </h1>
          <p className="text-xl text-gray-600">
            Set your goals and exam dates for a personalized learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Target className="h-12 w-12 text-sky-900 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Set Your Goals</h3>
                <p className="text-gray-600">
                  Choose how you want to track your progress
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CalendarIcon className="h-12 w-12 text-sky-900 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Plan Your Schedule</h3>
                <p className="text-gray-600">
                  Register your exam dates for optimal preparation
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="h-12 w-12 text-sky-900 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Track Your Time</h3>
                <p className="text-gray-600">
                  Set daily study targets that work for you
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg mb-20">
          <CardHeader>
            <CardTitle>Study Goals Setup</CardTitle>
            <CardDescription>
              Configure your exam preparation goals and schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">How would you like to track your progress?</Label>
              <RadioGroup
                value={goalType}
                onValueChange={setGoalType}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PROBLEMS" id="problems" />
                  <Label htmlFor="problems">Problems per day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MINUTES" id="minutes" />
                  <Label htmlFor="minutes">Minutes per day</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Daily goal amount</Label>
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder={`Enter ${goalType.toLowerCase()}`}
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-48"
                  min="1"
                  max={goalType === 'MINUTES' ? "720" : "100"}
                />
                <span className="text-gray-500 self-center">
                  {goalType === 'MINUTES' ? 'minutes' : 'problems'} per day
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {goalType === 'MINUTES' 
                  ? 'The SOA recommends around 100 minutes of study time per exam hour.' 
                  : 'Start with a manageable number and adjust as needed.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Registered Exams</Label>
                <Button 
                  variant="outline" 
                  onClick={addExam} 
                  type="button"
                  className="border-sky-900 text-sky-900 hover:bg-sky-50"
                >
                  Add Another Exam
                </Button>
              </div>

              {selectedExams.map((exam, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <Select
                    value={exam.exam}
                    onValueChange={(value) => updateExam(index, 'exam', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P">Exam P</SelectItem>
                      <SelectItem value="FM">Exam FM</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !exam.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exam.date ? format(exam.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={exam.date}
                        onSelect={(date) => updateExam(index, 'date', date)}
                        disabled={(date) =>
                          date < new Date() || date > new Date(2026, 11, 31)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExam(index)}
                    className="hover:bg-rose-900 hover:text-primary-foreground"
                    disabled={selectedExams.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {error && (
            <AnimatedAlert 
                message={error}
                variant="rose"
                onClose={() => setError('')}
            />
            )}

            {success && (
            <AnimatedAlert 
                message="Settings saved successfully!"
                variant="green"
                onClose={() => setSuccess(false)}
            />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-end">
          <Button 
            onClick={handleSubmit} 
            className="bg-sky-900 hover:bg-sky-800"
            size="lg"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}