// app/api/quizzes/[quizId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sql } from '@/lib/db'
import { NeonQueryFunction } from '@neondatabase/serverless'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizId = parseInt(params.quizId)
    const userId = session.user.id

    // Check if user owns the quiz
    const [quiz] = await sql`
      SELECT created_by FROM quizzes WHERE id = ${quizId}
    `

    if (!quiz || quiz.created_by !== userId) {
      return NextResponse.json({ error: 'Quiz not found or unauthorized' }, { status: 404 })
    }

    // Delete quiz and related data (cascade should handle this, but being explicit)
    await sql.transaction((sql) => [
      // Delete user answers
      sql`DELETE FROM user_answers WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})`,
      
      // Delete user progress
      sql`DELETE FROM user_quiz_progress WHERE quiz_id = ${quizId}`,
      
      // Delete answers
      sql`DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})`,
      
      // Delete questions
      sql`DELETE FROM questions WHERE quiz_id = ${quizId}`,
      
      // Delete quiz
      sql`DELETE FROM quizzes WHERE id = ${quizId}`
    ]);

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}