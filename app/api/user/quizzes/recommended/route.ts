import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserByEmail, sql } from "@/lib/db"

interface CategoryScore {
  count: number
  totalScore: number
}

interface CategoryScores {
  [category: string]: CategoryScore
}

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

    // Get user's completed quizzes
    const completedQuizzes = await sql`
      SELECT DISTINCT quiz_id 
      FROM user_quiz_progress 
      WHERE user_id = ${user.id}
    `
    const completedIds = completedQuizzes.map(q => q.quiz_id)

    // Get user's quiz attempts with categories to determine preferences
    const userQuizzes = await sql`
      SELECT 
        uqp.quiz_id,
        uqp.score,
        q.category
      FROM user_quiz_progress uqp
      JOIN quizzes q ON uqp.quiz_id = q.id
      WHERE uqp.user_id = ${user.id}
    `

    // Calculate category scores
    const categoryScores: CategoryScores = {}
    userQuizzes.forEach(attempt => {
      if (!categoryScores[attempt.category]) {
        categoryScores[attempt.category] = { count: 0, totalScore: 0 }
      }
      categoryScores[attempt.category].count++
      categoryScores[attempt.category].totalScore += attempt.score
    })

    // Get preferred categories
    const preferredCategories = Object.entries(categoryScores)
      .map(([category, stats]) => ({
        category,
        averageScore: stats.totalScore / stats.count
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3)
      .map(c => c.category)

    // Get recommended quizzes
    const recommendedQuizzes = await sql`
      SELECT 
        id,
        title,
        description,
        category,
        difficulty
      FROM quizzes
      WHERE (
        category = ANY(${preferredCategories})
        OR (
          ${userQuizzes.length === 0} 
          AND difficulty = 'Easy'
        )
      )
      AND id != ALL(${completedIds})
      ORDER BY created_at DESC
      LIMIT 5
    `

    return NextResponse.json(recommendedQuizzes)
  } catch (error) {
    console.error("[RECOMMENDED_QUIZZES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 