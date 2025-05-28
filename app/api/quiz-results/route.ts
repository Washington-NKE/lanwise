// app/api/quiz-results/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' 
import { createOrUpdateUserQuizProgress, getUserByEmail, saveUserAnswer, sql } from '@/lib/db' 

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quiz_id, score, time_taken, answers } = body

    // Validate required fields
    if (!quiz_id || score === undefined || time_taken === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: quiz_id, score, time_taken' },
        { status: 400 }
      )
    }

    // First, get the user ID from the email
    const user = await getUserByEmail(session.user.email)

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = user.id
    console.log(userId)

    // Insert the quiz result
    const result = await createOrUpdateUserQuizProgress(userId, quiz_id, score, true)

    const quizResultId = result.insertId

    // If answers are provided, save them as well
    if (answers && Object.keys(answers).length > 0) {
      const answerEntries = Object.entries(answers).map(([questionId, selectedAnswerId]) => [
        quizResultId,
        parseInt(questionId),
        parseInt(selectedAnswerId as string)
      ])

      // Save each user answer
      for (const [questionId, selectedAnswerId] of Object.entries(answers)) {
        await saveUserAnswer(
          userId,
          parseInt(questionId),
          parseInt(selectedAnswerId as string),
          false, // We don't have isCorrect info here
          0 // We don't have individual time taken info
        )
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        quiz_result_id: quizResultId,
        message: 'Quiz results saved successfully' 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error saving quiz results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quiz_id')
    const userId = searchParams.get('user_id')

    // Get the user ID from the email
    const user = await getUserByEmail(session.user.email)

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentUserId = user[0].id

    let query = `
      SELECT 
        qr.*,
        q.title as quiz_title,
        q.description as quiz_description,
        u.name as user_name,
        u.email as user_email
      FROM quiz_results qr
      JOIN quizzes q ON qr.quiz_id = q.id
      JOIN users u ON qr.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    // Add filters
    if (quizId) {
      query += ' AND qr.quiz_id = ?'
      params.push(parseInt(quizId))
    }

    if (userId) {
      query += ' AND qr.user_id = ?'
      params.push(parseInt(userId))
    } else {
      // If no specific user requested, only show current user's results
      query += ' AND qr.user_id = ?'
      params.push(currentUserId)
    }

    query += ' ORDER BY qr.completed_at DESC'

    const results = await sql`${query}`

    return NextResponse.json(results)

  } catch (error) {
    console.error('Error fetching quiz results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}