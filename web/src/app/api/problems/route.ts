import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: [{ exam: 'asc' }, { questionNumber: 'asc' }],
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problems' },
      { status: 500 },
    );
  }
}
