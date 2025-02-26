import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const exam = searchParams.get('exam') || 'P'
  
  try {
    const topics = await prisma.problem.findMany({
      where: { exam },
      select: { syllabusCategory: true },
      distinct: ['syllabusCategory']
    })
    
    return NextResponse.json(topics.map(t => t.syllabusCategory))
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}