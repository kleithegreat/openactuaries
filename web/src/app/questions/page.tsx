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
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

const LAST_QUESTION_KEY = 'lastQuestionIndex'
const LAST_EXAM_KEY = 'lastExam'
const LAST_CATEGORY_KEY = 'lastCategory'

export default function QuestionsPage() {
  const router = useRouter()
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

  const LoadingState = () => {
    return (
      <div className="space-y-8">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[180px] bg-background-secondary" />
          <Skeleton className="h-10 w-[280px] bg-background-secondary" />
          <Skeleton className="h-10 w-[180px] bg-background-secondary" />
        </div>
        <Card className="bg-background-highlight">
          <CardHeader>
            <Skeleton className="h-8 w-48 bg-background-secondary" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-4 w-full bg-background-secondary" />
                ))}
              </div>
              <div className="w-1/2 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full bg-background-secondary" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch('/api/problems')
        if (!response.ok) throw new Error('Failed to fetch problems')
        const data = await response.json()
        
        if (data.length > 0) {
          const savedExam = localStorage.getItem(LAST_EXAM_KEY)
          const savedCategory = localStorage.getItem(LAST_CATEGORY_KEY)
          const savedIndex = parseInt(localStorage.getItem(LAST_QUESTION_KEY) || '0')
          
          const initialExam = savedExam || data[0].exam
          const initialCategory = savedCategory || 'any'
          
          const validProblems = data.filter((p: Problem) => 
            p.exam === initialExam && 
            (initialCategory === 'any' || p.syllabusCategory === initialCategory)
          )

          const validIndex = validProblems.length > 0 ? 
            data.findIndex((p: Problem) => p.id === validProblems[0].id) : 0
          
          setProblems(data)
          setFilters({
            exam: initialExam,
            syllabusCategory: initialCategory,
          })
          setCurrentProblemIndex(savedIndex < data.length ? savedIndex : validIndex)
          
          const problem = data[savedIndex < data.length ? savedIndex : validIndex]
          
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
    localStorage.setItem(LAST_QUESTION_KEY, currentProblemIndex.toString())
    localStorage.setItem(LAST_EXAM_KEY, filters.exam)
    localStorage.setItem(LAST_CATEGORY_KEY, filters.syllabusCategory)
  }, [currentProblemIndex, filters])

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
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    )
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
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex gap-4 mb-8">
        <Select
          value={filters.exam}
          onValueChange={(value) => {
            setFilters(prev => ({ ...prev, exam: value, syllabusCategory: 'any' }));
            const newIndex = problems.findIndex(p => p.exam === value);
            if (newIndex !== -1) setCurrentProblemIndex(newIndex);
          }}
        >
          <SelectTrigger className="w-[180px] bg-background-highlight border-border hover:bg-background-secondary transition-colors">
            <SelectValue placeholder="Select Exam" />
          </SelectTrigger>
          <SelectContent className="bg-background-highlight border-border">
            {Array.from(new Set(problems.map(p => p.exam))).map(exam => (
              <SelectItem 
                key={exam} 
                value={exam} 
                className="text-foreground hover:bg-background-secondary"
              >
                Exam {exam}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <Select
          value={filters.syllabusCategory}
          onValueChange={(value) => {
            setFilters(prev => ({ ...prev, syllabusCategory: value }));
            if (value !== 'any') {
              const newIndex = problems.findIndex(p => 
                p.exam === filters.exam && 
                p.syllabusCategory === value
              );
              if (newIndex !== -1) setCurrentProblemIndex(newIndex);
            }
          }}
        >
          <SelectTrigger className="w-[280px] bg-background-highlight border-border hover:bg-background-secondary transition-colors">
            <SelectValue placeholder="Select Topic" />
          </SelectTrigger>
          <SelectContent className="bg-background-highlight border-border">
            <SelectItem value="any" className="text-foreground hover:bg-background-secondary">
              Any Topic
            </SelectItem>
            {uniqueSyllabusCategories.map(category => (
              <SelectItem 
                key={category} 
                value={category} 
                className="text-foreground hover:bg-background-secondary"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <Select
          value={currentProblem.id}
          onValueChange={(value) => {
            const newIndex = problems.findIndex(p => p.id === value);
            if (newIndex !== -1) setCurrentProblemIndex(newIndex);
          }}
        >
          <SelectTrigger className="w-[180px] bg-background-highlight border-border hover:bg-background-secondary transition-colors">
            <SelectValue placeholder="Select Question" />
          </SelectTrigger>
          <SelectContent className="bg-background-highlight border-border">
            {filteredProblems.map((problem) => (
              <SelectItem 
                key={problem.id} 
                value={problem.id}
                className="text-foreground hover:bg-background-secondary"
              >
                Question {problem.questionNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
  
      <Card className="bg-background-highlight border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground font-serif">Question {currentProblem.questionNumber}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="prose max-w-none text-foreground [&_table]:w-auto [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-border [&_th]:bg-background-secondary [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:text-sm [&_td]:text-sm [&_table]:mx-auto [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:my-4">
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
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'border-border hover:bg-background-secondary text-foreground'
                  }`}
                >
                  <div className="flex">
                    <span className="font-medium mr-2 min-w-[1.5rem]">{choice.letter})</span>
                    <div className="flex-1">
                      {serializedChoices[index] && <MDXRemote {...serializedChoices[index]} />}
                    </div>
                  </div>
                </button>
              ))}
  
              {checkedAnswers[currentProblem.id] && (
                <Alert 
                  variant={isCurrentAnswerCorrect ? "success" : "destructive"}
                  className={`
                    ${isCurrentAnswerCorrect 
                      ? "bg-success/10 text-success border-success/20" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  `}
                >
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
  
      <div className="fixed bottom-0 left-0 right-0 bg-background-highlight border-t border-border p-4">
        <div className="container mx-auto flex items-center justify-between max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push('/home')}
            className="text-primary hover:text-primary-dark hover:bg-background-secondary transition-colors"
          >
            Back to Home
          </Button>
  
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigateQuestion('prev')}
              disabled={filteredProblems.findIndex(p => p.id === currentProblem.id) === 0}
              className="w-24 border-border text-foreground hover:bg-background-secondary disabled:opacity-50 transition-colors"
            >
              Previous
            </Button>
  
            <div className="w-36">
              {!checkedAnswers[currentProblem.id] ? (
                <Button 
                  onClick={() => checkAnswer(currentProblem.id)}
                  disabled={!selectedAnswers[currentProblem.id]}
                  className="bg-primary hover:bg-primary-dark text-white w-full disabled:opacity-50 transition-colors"
                >
                  Check Answer
                </Button>
              ) : (
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-dark text-white w-full transition-colors">
                      View Explanation
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-background-highlight">
                    <div className="mx-auto w-full max-w-4xl">
                      <DrawerHeader className="border-b border-border">
                        <DrawerTitle className="text-foreground font-serif">Explanation</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-6 prose max-w-none h-[500px] overflow-auto text-foreground">
                        {serializedExplanation && <MDXRemote {...serializedExplanation} />}
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
            </div>
  
            <Button
              variant="outline"
              onClick={() => navigateQuestion('next')}
              disabled={filteredProblems.findIndex(p => p.id === currentProblem.id) === filteredProblems.length - 1}
              className="w-24 border-border text-foreground hover:bg-background-secondary disabled:opacity-50 transition-colors"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}