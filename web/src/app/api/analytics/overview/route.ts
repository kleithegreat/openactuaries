import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        problemAttempts: true,
        studySessions: true
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const totalProblemsSolved = profile.problemAttempts.length
    const correct = profile.problemAttempts.filter(a => a.isCorrect).length
    const accuracy = totalProblemsSolved > 0 ? Math.round((correct / totalProblemsSolved) * 100) : 0
    const studyMinutes = profile.studySessions.reduce((acc, s) => acc + (s.minutesSpent ?? 0), 0)
    const totalStudyHours = Math.round(studyMinutes / 60)

    return NextResponse.json({ totalProblemsSolved, totalStudyHours, accuracy })
  } catch (error) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 })
  }
}
