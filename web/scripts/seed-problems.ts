import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');

    // Read P exam problems
    const pExamPath = path.join(
      process.cwd(),
      '..',
      'data',
      'processed',
      'p_exam.json',
    );
    console.log('Reading P exam from:', pExamPath);
    const pExamData = await fs.readFile(pExamPath, 'utf-8');
    const pExamProblems = JSON.parse(pExamData);
    console.log(`Found ${pExamProblems.length} P exam problems`);

    // Read FM exam problems
    const fmExamPath = path.join(
      process.cwd(),
      '..',
      'data',
      'processed',
      'fm_exam.json',
    );
    console.log('Reading FM exam from:', fmExamPath);
    const fmExamData = await fs.readFile(fmExamPath, 'utf-8');
    const fmExamProblems = JSON.parse(fmExamData);
    console.log(`Found ${fmExamProblems.length} FM exam problems`);

    const allProblems = [...pExamProblems, ...fmExamProblems];
    console.log(`Total problems to insert: ${allProblems.length}`);

    console.log('Clearing existing problems...');
    await prisma.problem.deleteMany();

    console.log('Inserting problems...');
    let inserted = 0;
    for (const problem of allProblems) {
      await prisma.problem.create({
        data: {
          exam: problem.exam,
          questionNumber: problem.question,
          statement: problem.content,
          choices: problem.choices,
          correctAnswer: problem.answer,
          syllabusCategory: problem.syllabus_category,
          severity: problem.severity,
          explanation: problem.explanation,
        },
      });
      inserted++;
      if (inserted % 10 === 0) {
        console.log(`Inserted ${inserted}/${allProblems.length} problems`);
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
