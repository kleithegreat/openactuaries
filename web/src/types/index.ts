export interface Choice {
    letter: string
    content: string
}

export interface Problem {
    exam: string
    question: number
    content: string
    choices: Choice[]
    syllabus_category: string
    severity: number
    answer: string
}