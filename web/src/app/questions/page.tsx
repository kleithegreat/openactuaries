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
import type { Problem, Choice } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function QuestionsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({})
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [serializedContent, setSerializedContent] = useState<MDXRemoteSerializeResult | null>(null)
  const [serializedChoices, setSerializedChoices] = useState<MDXRemoteSerializeResult[]>([])
  const [filters, setFilters] = useState({
    exam: '',
    syllabusCategory: 'any',
  })

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch('/api/problems')
        if (!response.ok) throw new Error('Failed to fetch problems')
        const data = await response.json()
        setProblems(data)
        
        // Set initial filters
        if (data.length > 0) {
          setFilters({
            exam: data[0].exam,
            syllabusCategory: 'any',
          })
        }

        // Serialize the initial problem's content
        if (data.length > 0) {
          const serialized = await serialize(data[0].statement, {
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            }
          })
          setSerializedContent(serialized)

          const serializedChoicesPromises = data[0].choices.map((choice: Choice) => 
            serialize(choice.content, {
              mdxOptions: {
                remarkPlugins: [remarkMath],
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

  // Filter problems based on current filters
  const filteredProblems = problems.filter(problem => {
    if (problem.exam !== filters.exam) return false;
    if (filters.syllabusCategory !== 'any' && problem.syllabusCategory !== filters.syllabusCategory) return false;
    return true;
  });

  useEffect(() => {
    async function serializeNewProblem() {
      if (!problems.length || currentProblemIndex >= problems.length) return

      const currentProblem = problems[currentProblemIndex]
      
      const serialized = await serialize(currentProblem.statement, {
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        }
      })
      setSerializedContent(serialized)

      const serializedChoicesPromises = currentProblem.choices.map((choice: Choice) => 
        serialize(choice.content, {
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          }
        })
      )
      const choicesContent = await Promise.all(serializedChoicesPromises)
      setSerializedChoices(choicesContent)
    }

    serializeNewProblem()
  }, [currentProblemIndex, problems])

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
    if (direction === 'next' && currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1)
    } else if (direction === 'prev' && currentProblemIndex > 0) {
      setCurrentProblemIndex(prev => prev - 1)
    }
  }

  const uniqueSyllabusCategories = Array.from(
    new Set(problems.filter(p => p.exam === filters.exam).map(p => p.syllabusCategory))
  );

  const isCurrentAnswerCorrect = selectedAnswers[currentProblem.id] === currentProblem.correctAnswer

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Practice Questions</h1>
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
      </div>

      <div className="flex gap-6">
        <div className="w-32 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[60vh]">
              <div className="px-4 pb-4">
                {filteredProblems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => {
                      const newIndex = problems.findIndex(p => p.id === problem.id)
                      if (newIndex !== -1) setCurrentProblemIndex(newIndex)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 ${
                      problem.id === currentProblem.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {problem.questionNumber}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Question {currentProblem.questionNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <MDXRemote {...serializedContent} />
              </div>

              <div className="mt-6 space-y-3">
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
              </div>

              <div className="mt-6 space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <Button
            variant="outline"
            onClick={() => navigateQuestion('prev')}
            disabled={currentProblemIndex === 0}
            className="w-24"
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

          <Button
            variant="outline"
            onClick={() => navigateQuestion('next')}
            disabled={currentProblemIndex === problems.length - 1}
            className="w-24"
          >
            Next
          </Button>
        </div>
      </div>
    
    </div>
  )
}