'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, X } from 'lucide-react'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import type { Problem, Choice } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

const LAST_QUESTION_KEY = 'lastQuestionIndex'
const LAST_EXAM_KEY = 'lastExam'
const LAST_CATEGORY_KEY = 'lastCategory'

export default function QuestionsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({})
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [serializedContent, setSerializedContent] = useState<MDXRemoteSerializeResult | null>(null)
  const [serializedChoices, setSerializedChoices] = useState<MDXRemoteSerializeResult[]>([])
  const [serializedExplanation, setSerializedExplanation] = useState<MDXRemoteSerializeResult | null>(null)
  const [filters, setFilters] = useState({
    exam: '',
    syllabusCategory: 'any',
  })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const savedIndex = localStorage.getItem(LAST_QUESTION_KEY)
    const savedExam = localStorage.getItem(LAST_EXAM_KEY)
    const savedCategory = localStorage.getItem(LAST_CATEGORY_KEY)
    
    if (savedIndex) {
      setCurrentProblemIndex(parseInt(savedIndex))
    }
    if (savedExam || savedCategory) {
      setFilters(prev => ({
        exam: savedExam || prev.exam,
        syllabusCategory: savedCategory || prev.syllabusCategory
      }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LAST_QUESTION_KEY, currentProblemIndex.toString())
    localStorage.setItem(LAST_EXAM_KEY, filters.exam)
    localStorage.setItem(LAST_CATEGORY_KEY, filters.syllabusCategory)
  }, [currentProblemIndex, filters])

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch('/api/problems')
        if (!response.ok) throw new Error('Failed to fetch problems')
        const data = await response.json()
        setProblems(data)
        
        if (data.length > 0 && !localStorage.getItem(LAST_EXAM_KEY)) {
          setFilters({
            exam: data[0].exam,
            syllabusCategory: 'any',
          })
        }

        if (data.length > 0) {
          const targetIndex = parseInt(localStorage.getItem(LAST_QUESTION_KEY) || '0')
          const problem = data[targetIndex] || data[0]
          
          const [serializedStatement, serializedExp] = await Promise.all([
            serialize(problem.statement, {
              mdxOptions: {
                remarkPlugins: [remarkMath, remarkGfm],
                rehypePlugins: [rehypeKatex],
              }
            }),
            serialize(problem.explanation, {
              mdxOptions: {
                remarkPlugins: [remarkMath, remarkGfm],
                rehypePlugins: [rehypeKatex],
              }
            })
          ])
          
          setSerializedContent(serializedStatement)
          setSerializedExplanation(serializedExp)

          const serializedChoicesPromises = problem.choices.map((choice: Choice) => 
            serialize(choice.content, {
              mdxOptions: {
                remarkPlugins: [remarkMath, remarkGfm],
                rehypePlugins: [rehypeKatex],
              }
            })
          )
          const choicesContent = await Promise.all(serializedChoicesPromises)
          setSerializedChoices(choicesContent)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problems')
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [])

  useEffect(() => {
    async function serializeNewProblem() {
      if (!problems.length || currentProblemIndex >= problems.length) return

      const currentProblem = problems[currentProblemIndex]
      
      const [serializedStatement, serializedExp] = await Promise.all([
        serialize(currentProblem.statement, {
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [rehypeKatex],
          }
        }),
        serialize(currentProblem.explanation, {
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [rehypeKatex],
          }
        })
      ])
      
      setSerializedContent(serializedStatement)
      setSerializedExplanation(serializedExp)

      const serializedChoicesPromises = currentProblem.choices.map((choice: Choice) => 
        serialize(choice.content, {
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [rehypeKatex],
          }
        })
      )
      const choicesContent = await Promise.all(serializedChoicesPromises)
      setSerializedChoices(choicesContent)
    }

    serializeNewProblem()
  }, [currentProblemIndex, problems])

  const filteredProblems = problems.filter(problem => {
    if (problem.exam !== filters.exam) return false;
    if (filters.syllabusCategory !== 'any' && problem.syllabusCategory !== filters.syllabusCategory) return false;
    return true;
  });

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading questions...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>
  }

  const currentProblem = problems[currentProblemIndex]
  if (!currentProblem || !serializedContent) {
    return <div className="container mx-auto px-4 py-8">No questions available</div>
  }

  const handleAnswerSelect = (problemId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [problemId]: answer
    }))
    setCheckedAnswers(prev => ({
      ...prev,
      [problemId]: false
    }))
  }

  const checkAnswer = (problemId: string) => {
    setCheckedAnswers(prev => ({
      ...prev,
      [problemId]: true
    }))
  }

  const navigateQuestion = (direction: 'prev' | 'next') => {
    const currentExamProblems = filteredProblems
    const currentExamIndex = currentExamProblems.findIndex(p => p.id === currentProblem.id)
    
    if (direction === 'next' && currentExamIndex < currentExamProblems.length - 1) {
      const nextProblem = currentExamProblems[currentExamIndex + 1]
      const nextIndex = problems.findIndex(p => p.id === nextProblem.id)
      setCurrentProblemIndex(nextIndex)
    } else if (direction === 'prev' && currentExamIndex > 0) {
      const prevProblem = currentExamProblems[currentExamIndex - 1]
      const prevIndex = problems.findIndex(p => p.id === prevProblem.id)
      setCurrentProblemIndex(prevIndex)
    }
  }

  const uniqueSyllabusCategories = Array.from(
    new Set(problems.filter(p => p.exam === filters.exam).map(p => p.syllabusCategory))
  );

  const isCurrentAnswerCorrect = selectedAnswers[currentProblem.id] === currentProblem.correctAnswer

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Question Browser</h1>
      </div>
  
      <div className="flex gap-4 mb-8">
        <Select
          value={filters.exam}
          onValueChange={(value) => {
            setFilters(prev => ({ ...prev, exam: value, syllabusCategory: 'any' }))
            const newIndex = problems.findIndex(p => p.exam === value)
            if (newIndex !== -1) setCurrentProblemIndex(newIndex)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(new Set(problems.map(p => p.exam))).map(exam => (
              <SelectItem key={exam} value={exam}>
                Exam {exam}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <Select
          value={filters.syllabusCategory}
          onValueChange={(value) => {
            setFilters(prev => ({ ...prev, syllabusCategory: value }))
            if (value !== 'any') {
              const newIndex = problems.findIndex(p => 
                p.exam === filters.exam && 
                p.syllabusCategory === value
              )
              if (newIndex !== -1) setCurrentProblemIndex(newIndex)
            }
          }}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Topic</SelectItem>
            {uniqueSyllabusCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <Select
          value={currentProblem.id}
          onValueChange={(value) => {
            const newIndex = problems.findIndex(p => p.id === value)
            if (newIndex !== -1) setCurrentProblemIndex(newIndex)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Question" />
          </SelectTrigger>
          <SelectContent>
            {filteredProblems.map((problem) => (
              <SelectItem key={problem.id} value={problem.id}>
                Question {problem.questionNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
  
      <Card>
        <CardHeader>
          <CardTitle>Question {currentProblem.questionNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="prose max-w-none [&_table]:w-auto [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:text-sm [&_td]:text-sm [&_table]:mx-auto [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:my-4">
                <MDXRemote {...serializedContent} />
              </div>
            </div>

            <div className="w-1/2 space-y-3">
              {currentProblem.choices.map((choice, index) => (
                <button
                  key={choice.letter}
                  onClick={() => handleAnswerSelect(currentProblem.id, choice.letter)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswers[currentProblem.id] === choice.letter
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex">
                    <span className="font-medium mr-2 min-w-[1.5rem]">{choice.letter}) </span>
                    <div className="flex-1">
                      {serializedChoices[index] && <MDXRemote {...serializedChoices[index]} />}
                    </div>
                  </div>
                </button>
              ))}

              {checkedAnswers[currentProblem.id] && (
                <Alert variant={isCurrentAnswerCorrect ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {isCurrentAnswerCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {isCurrentAnswerCorrect
                        ? "Correct!"
                        : `Incorrect. The correct answer is ${currentProblem.correctAnswer}.`}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <Button
            variant="outline"
            onClick={() => navigateQuestion('prev')}
            disabled={filteredProblems.findIndex(p => p.id === currentProblem.id) === 0}
            className="w-24 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>

          {selectedAnswers[currentProblem.id] && !checkedAnswers[currentProblem.id] && (
            <Button 
              onClick={() => checkAnswer(currentProblem.id)}
            >
              Check Answer
            </Button>
          )}

          {checkedAnswers[currentProblem.id] && (
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button>View Explanation</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-4xl">
                  <DrawerHeader>
                    <DrawerTitle>Explanation</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-6 prose max-w-none h-[500px] overflow-auto">
                    {serializedExplanation && (
                      <MDXRemote
                        key={currentProblem.id} // Add key to force re-render
                        {...serializedExplanation}
                      />
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}

          <Button
            variant="outline"
            onClick={() => navigateQuestion('next')}
            disabled={filteredProblems.findIndex(p => p.id === currentProblem.id) === filteredProblems.length - 1}
            className="w-24 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}