import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const exam = searchParams.get('exam') || 'P'

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const attempts = await prisma.problemAttempt.findMany({
      where: { profileId: profile.id, problem: { exam } },
      include: { problem: { select: { syllabusCategory: true } } },
    })

    const topicStats: Record<string, { attempts: number; correct: number }> = {}

    for (const attempt of attempts) {
      const topic = attempt.problem.syllabusCategory
      if (!topicStats[topic]) {
        topicStats[topic] = { attempts: 0, correct: 0 }
      }
      topicStats[topic].attempts += 1
      if (attempt.isCorrect) {
        topicStats[topic].correct += 1
      }
    }

    const breakdown = Object.entries(topicStats).map(([topic, { attempts }]) => ({
      topic,
      value: attempts,
    }))

    const performance = Object.entries(topicStats).map(([topic, data]) => ({
      subject: topic,
      accuracy: data.attempts ? Math.round((data.correct / data.attempts) * 100) : 0,
    }))

    const sorted = performance
      .map(p => ({ ...p, attempts: topicStats[p.subject].attempts }))
      .sort((a, b) => a.accuracy - b.accuracy)
    const cutoff = Math.ceil(sorted.length / 3)
    const toFocus = sorted.slice(0, cutoff).map(t => ({
      topic: t.subject,
      accuracy: t.accuracy,
      problems: t.attempts,
    }))

    return NextResponse.json({ breakdown, performance, toFocus })
  } catch (error) {
    console.error('Error fetching topics analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch topics analytics' }, { status: 500 })
  }
}
