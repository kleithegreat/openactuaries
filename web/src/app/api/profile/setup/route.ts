import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { goalType, goalAmount, examRegistrations } = body

    // get user's profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        goalType,
        goalAmount,
      },
      create: {
        userId: user.id,
        goalType,
        goalAmount,
      },
    })

    // delete existing exam registrations
    await prisma.examRegistration.deleteMany({
      where: { profileId: profile.id }
    })

    // create new exam registrations
    const examPromises = examRegistrations.map(async (reg: { exam: string, date: string }) => {
      return prisma.examRegistration.create({
        data: {
          profileId: profile.id,
          examType: reg.exam,
          examDate: new Date(reg.date),
        }
      })
    })

    await Promise.all(examPromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}