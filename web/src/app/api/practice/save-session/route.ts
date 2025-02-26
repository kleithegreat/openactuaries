import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db'

interface ProblemData {
  id: string;
  [key: string]: unknown;
}

interface AnswerData {
  problemId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  try {
    const data = await request.json() 
    const _problems: ProblemData[] = data.problems
    const answers: AnswerData[] = data.answers
    
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    const studySession = await prisma.studySession.create({
      data: {
        profileId: userProfile.id,
        startTime: new Date(Date.now() - (answers.reduce((sum: number, a: AnswerData) => sum + a.timeSpent, 0) * 1000)),
        endTime: new Date(),
        minutesSpent: Math.ceil(answers.reduce((sum: number, a: AnswerData) => sum + a.timeSpent, 0) / 60),
        notes: 'Guided practice session'
      }
    })
    
    const attemptPromises = answers.map((answer: AnswerData, _index: number) => {
      return prisma.problemAttempt.create({
        data: {
          profileId: userProfile.id,
          problemId: answer.problemId,
          studySessionId: studySession.id,
          userAnswer: answer.answer,
          isCorrect: answer.isCorrect,
          timeSpent: answer.timeSpent,
          confidence: 3,
          reviewMarked: false,
          attemptNumber: 1, // default to first attempt
        }
      })
    })
    
    await Promise.all(attemptPromises)
    
    return NextResponse.json({ success: true, sessionId: studySession.id })
  } catch (error) {
    console.error('Error saving practice session:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}