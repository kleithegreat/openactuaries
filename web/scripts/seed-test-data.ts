import { PrismaClient, User, Problem, UserProfile } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const NUM_USERS = 50
const DAYS_OF_HISTORY = 90
const STUDY_SESSIONS_PER_USER = 30
const PROBLEMS_PER_SESSION = 15

type UserWithProfile = User & {
  profile: UserProfile | null
}

const EXAM_WINDOWS = {
  P: [
    { start: '2025-01-15', end: '2025-02-15' },
    { start: '2025-05-15', end: '2025-06-15' },
    { start: '2025-09-15', end: '2025-10-15' }
  ],
  FM: [
    { start: '2025-02-15', end: '2025-03-15' },
    { start: '2025-06-15', end: '2025-07-15' },
    { start: '2025-10-15', end: '2025-11-15' }
  ]
}

function assertProfile(user: UserWithProfile): asserts user is User & { profile: UserProfile } {
  if (!user.profile) {
    throw new Error(`User ${user.id} has no profile`)
  }
}

async function main() {
  console.log('Starting to seed test data...')
  console.time('Seeding completed in')

  await clearExistingData()
  const users = await createUsers()
  const problems = await prisma.problem.findMany()
  if (problems.length === 0) {
    throw new Error('No problems found in database. Please run the problem seed script first.')
  }
  await createExamRegistrations(users)
  await createStudyData(users, problems)

  console.timeEnd('Seeding completed in')
}

async function clearExistingData() {
  console.log('Clearing existing test data...')
  await prisma.$transaction([
    prisma.problemAttempt.deleteMany(),
    prisma.studySession.deleteMany(),
    prisma.examRegistration.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

async function createUsers(): Promise<UserWithProfile[]> {
  console.log('Creating test users...')
  
  const testPassword = 'password123'
  const hashedTestPassword = await bcrypt.hash(testPassword, 10)
  
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: hashedTestPassword,
  }
  
  const userData = [
    testUser,
    ...await Promise.all(Array.from({ length: NUM_USERS - 1 }, async () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await bcrypt.hash(faker.internet.password(), 10),
    })))
  ]

  const users = await prisma.$transaction(
    userData.map(data => 
      prisma.user.create({
        data: {
          ...data,
          profile: {
            create: {
              goalType: faker.helpers.arrayElement(['PROBLEMS', 'MINUTES']),
              goalAmount: faker.number.int({ min: 5, max: 30 })
            }
          }
        },
        include: {
          profile: true
        }
      })
    )
  )
  
  return users
}

async function createExamRegistrations(users: UserWithProfile[]) {
  console.log('Creating exam registrations...')
  
  const examRegistrations = users.flatMap(user => {
    assertProfile(user)
    const registerForBoth = faker.datatype.boolean({ probability: 0.3 })
    const exams = registerForBoth ? ['P', 'FM'] : [faker.helpers.arrayElement(['P', 'FM'])]
    
    return exams.map(examType => {
      const examWindow = faker.helpers.arrayElement(EXAM_WINDOWS[examType as keyof typeof EXAM_WINDOWS])
      const startDate = new Date(examWindow.start)
      const endDate = new Date(examWindow.end)
      
      return {
        profileId: user.profile.id,
        examType,
        examDate: faker.date.between({ from: startDate, to: endDate }),
      }
    })
  })

  await prisma.examRegistration.createMany({
    data: examRegistrations
  })
}

async function createStudyData(users: UserWithProfile[], problems: Problem[]) {
  console.log('Creating study sessions and problem attempts...')
  
  const CHUNK_SIZE = 10
  for (let i = 0; i < users.length; i += CHUNK_SIZE) {
    const userChunk = users.slice(i, i + CHUNK_SIZE)
    
    const studySessions = []
    const problemAttempts = []
    
    for (const user of userChunk) {
      assertProfile(user)
      
      for (let j = 0; j < STUDY_SESSIONS_PER_USER; j++) {
        const startTime = faker.date.past({ years: DAYS_OF_HISTORY / 365 })
        const duration = faker.number.int({ min: 30, max: 180 })
        const endTime = new Date(startTime.getTime() + duration * 60000)
        
        const sessionId = faker.string.uuid()
        studySessions.push({
          id: sessionId,
          profileId: user.profile.id,
          startTime,
          endTime,
          minutesSpent: duration,
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 })
        })
        
        const sessionProblems = faker.helpers.arrayElements(problems, PROBLEMS_PER_SESSION)
        problemAttempts.push(
          ...sessionProblems.map(problem => ({
            profileId: user.profile.id,
            problemId: problem.id,
            studySessionId: sessionId,
            userAnswer: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']),
            isCorrect: faker.datatype.boolean({ probability: 0.7 }),
            timeSpent: faker.number.int({ min: 60, max: 300 }),
            confidence: faker.number.int({ min: 1, max: 5 }),
            reviewMarked: faker.datatype.boolean({ probability: 0.2 }),
            notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
            attemptNumber: faker.number.int({ min: 1, max: 3 })
          }))
        )
      }
    }
    
    await prisma.$transaction([
      prisma.studySession.createMany({ data: studySessions }),
      prisma.problemAttempt.createMany({ data: problemAttempts })
    ])
    
    console.log(`Processed ${Math.min(i + CHUNK_SIZE, users.length)}/${users.length} users`)
  }
}

main()
  .catch((e) => {
    console.error('Error seeding test data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })