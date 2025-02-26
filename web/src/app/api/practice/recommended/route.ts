import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  try {
    const requestData = await request.json()
    const { 
      problemCount = 10, 
      examType = 'P'
    } = requestData
    
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        problemAttempts: {
          select: { problemId: true }
        }
      }
    })
    
    const attemptedProblemIds = userProfile?.problemAttempts.map(attempt => attempt.problemId) || []
    
    let recommendedProblems = await prisma.problem.findMany({
      where: {
        exam: examType,
        id: { notIn: attemptedProblemIds }
      },
      take: problemCount,
      orderBy: [
        { syllabusCategory: 'asc' },
        { questionNumber: 'asc' }
      ]
    })
    
    if (recommendedProblems.length < problemCount) {
      const additionalProblems = await prisma.problem.findMany({
        where: {
          exam: examType,
          id: { 
            notIn: recommendedProblems.map(p => p.id)
          }
        },
        take: problemCount - recommendedProblems.length,
        orderBy: [
          { syllabusCategory: 'asc' },
          { questionNumber: 'asc' }
        ]
      })
      
      recommendedProblems = [...recommendedProblems, ...additionalProblems]
    }
    
    recommendedProblems = recommendedProblems
      .sort(() => Math.random() - 0.5)
    
    return NextResponse.json(recommendedProblems)
  } catch (error) {
    console.error('Error getting recommended problems:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}