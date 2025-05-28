// app/api/quizzes/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Get quizzes in progress (not completed)
    const inProgressQuizzes = await sql`
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        uqp.score as progress,
        uqp.updated_at as last_played
      FROM user_quiz_progress uqp
      JOIN quizzes q ON uqp.quiz_id = q.id
      WHERE uqp.user_id = ${userId} 
        AND uqp.completed = false
      ORDER BY uqp.updated_at DESC
    `

    return NextResponse.json(inProgressQuizzes)
  } catch (error) {
    console.error('Error fetching in-progress quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}