import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db' // Use the existing Neon connection

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const period = searchParams.get('period') || 'all-time' // all-time, monthly, weekly

    let leaderboardData

    // Execute different queries based on the period
    if (period === 'monthly') {
      leaderboardData = await sql`
        SELECT 
          u.id,
          u.name,
          u.image,
          COUNT(DISTINCT uqp.quiz_id) as quizzes_completed,
          COALESCE(SUM(uqp.score), 0) as total_score
        FROM users u
        LEFT JOIN user_quiz_progress uqp ON u.id = uqp.user_id
        WHERE uqp.completed = true 
          AND uqp.completed_at >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY u.id, u.name, u.image
        HAVING COUNT(DISTINCT uqp.quiz_id) > 0
        ORDER BY total_score DESC, quizzes_completed DESC
        LIMIT ${limit}
      `
    } else if (period === 'weekly') {
      leaderboardData = await sql`
        SELECT 
          u.id,
          u.name,
          u.image,
          COUNT(DISTINCT uqp.quiz_id) as quizzes_completed,
          COALESCE(SUM(uqp.score), 0) as total_score
        FROM users u
        LEFT JOIN user_quiz_progress uqp ON u.id = uqp.user_id
        WHERE uqp.completed = true 
          AND uqp.completed_at >= DATE_TRUNC('week', CURRENT_DATE)
        GROUP BY u.id, u.name, u.image
        HAVING COUNT(DISTINCT uqp.quiz_id) > 0
        ORDER BY total_score DESC, quizzes_completed DESC
        LIMIT ${limit}
      `
    } else {
      // All-time leaderboard
      leaderboardData = await sql`
        SELECT 
          u.id,
          u.name,
          u.image,
          COUNT(DISTINCT uqp.quiz_id) as quizzes_completed,
          COALESCE(SUM(uqp.score), 0) as total_score
        FROM users u
        LEFT JOIN user_quiz_progress uqp ON u.id = uqp.user_id
        WHERE uqp.completed = true
        GROUP BY u.id, u.name, u.image
        HAVING COUNT(DISTINCT uqp.quiz_id) > 0
        ORDER BY total_score DESC, quizzes_completed DESC
        LIMIT ${limit}
      `
    }

    // Transform the data to match component expectations
    const transformedData = leaderboardData.map((row, index) => ({
      id: row.id,
      name: row.name,
      image: row.image,
      quizzes_completed: parseInt(row.quizzes_completed.toString()),
      total_score: parseInt(row.total_score.toString()),
      rank: index + 1
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: transformedData.length,
      period: period
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leaderboard data',
        data: [],
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// Optional: POST method for updating leaderboard (if needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, quizId, score, completed } = body

    // Validate required fields
    if (!userId || !quizId || score === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, quizId, and score are required'
        },
        { status: 400 }
      )
    }

    // Use the existing createOrUpdateUserQuizProgress function
    const completedAt = completed ? new Date() : null
    const result = await sql`
      INSERT INTO user_quiz_progress (user_id, quiz_id, score, completed, completed_at)
      VALUES (${userId}, ${quizId}, ${score}, ${completed || true}, ${completedAt})
      ON CONFLICT (user_id, quiz_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        completed = EXCLUDED.completed,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0]
    })

  } catch (error) {
    console.error('Error updating quiz result:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update quiz result',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}