// app/api/quizzes/created/route.ts
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
    
    // Get quizzes created by the user
    const createdQuizzes = await sql`
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.created_at,
        COUNT(DISTINCT quest.id) as questions,
        COUNT(DISTINCT uqp.user_id) as participants
      FROM quizzes q
      LEFT JOIN questions quest ON q.id = quest.quiz_id
      LEFT JOIN user_quiz_progress uqp ON q.id = uqp.quiz_id AND uqp.completed = true
      WHERE q.created_by = ${userId}
      GROUP BY q.id, q.title, q.description, q.category, q.difficulty, q.created_at
      ORDER BY q.created_at DESC
    `

    return NextResponse.json(createdQuizzes)
  } catch (error) {
    console.error('Error fetching created quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
