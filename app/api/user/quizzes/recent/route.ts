import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserByEmail, sql } from "@/lib/db" // Adjust path as needed

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user by email first
    const user = await getUserByEmail(session.user.email)
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get recent quiz attempts with quiz details
    const recentQuizzes = await sql`
      SELECT 
        uqp.id,
        uqp.score,
        uqp.completed_at as date,
        q.id as quiz_id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        -- Count total questions for this quiz
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as total_questions,
        -- Calculate correct answers based on score and total questions
        CASE 
          WHEN (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) > 0 
          THEN ROUND((uqp.score::float / 100) * (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id))
          ELSE 0 
        END as correct_answers
      FROM user_quiz_progress uqp
      JOIN quizzes q ON uqp.quiz_id = q.id
      WHERE uqp.user_id = ${user.id} 
        AND uqp.completed = true
      ORDER BY uqp.completed_at DESC
      LIMIT 5
    `

    const formattedQuizzes = recentQuizzes.map(attempt => ({
      id: attempt.id,
      title: attempt.title,
      score: attempt.score,
      date: attempt.date,
      correctAnswers: attempt.correct_answers,
      totalQuestions: attempt.total_questions,
      category: attempt.category,
      difficulty: attempt.difficulty
    }))

    return NextResponse.json(formattedQuizzes)
  } catch (error) {
    console.error("[RECENT_QUIZZES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}