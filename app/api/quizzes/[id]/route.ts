import { NextRequest, NextResponse } from 'next/server'
import { getQuizById, getQuizQuestions, getQuestionAnswers } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = parseInt(params.id)
    
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      )
    }

    // Get quiz details
    const quiz = await getQuizById(quizId)
    
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Get quiz questions with their answers
    const questions = await getQuizQuestions(quizId)
    
    // For each question, get its answers
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const answers = await getQuestionAnswers(question.id)
        return {
          ...question,
          answers: answers
        }
      })
    )

    // Return quiz with questions and answers
    const quizWithQuestions = {
      ...quiz,
      questions: questionsWithAnswers
    }

    return NextResponse.json(quizWithQuestions)

  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}