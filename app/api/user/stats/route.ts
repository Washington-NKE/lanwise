import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserByEmail, sql } from "@/lib/db"

const ACHIEVEMENT_TYPES = {
  QUIZ_MASTER: {
    title: "Quiz Master",
    description: "Complete 10 quizzes with a score of 80% or higher",
    requirement: 10
  },
  QUICK_LEARNER: {
    title: "Quick Learner",
    description: "Complete 5 quizzes in a single day",
    requirement: 5
  },
  PERFECT_SCORE: {
    title: "Perfect Score",
    description: "Get 100% score on any quiz",
    requirement: 1
  },
  DEDICATED_LEARNER: {
    title: "Dedicated Learner",
    description: "Complete quizzes for 5 consecutive days",
    requirement: 5
  },
  KNOWLEDGE_SEEKER: {
    title: "Knowledge Seeker",
    description: "Complete quizzes in 3 different categories",
    requirement: 3
  }
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

    // Get user's quiz attempts with quiz details including categories
    const userQuizzes = await sql`
      SELECT 
        uqp.id,
        uqp.score,
        uqp.completed_at,
        q.category,
        q.id as quiz_id,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as total_questions
      FROM user_quiz_progress uqp
      JOIN quizzes q ON uqp.quiz_id = q.id
      WHERE uqp.user_id = ${user.id}
        AND uqp.completed = true
      ORDER BY uqp.completed_at DESC
    `

    // Calculate stats
    const totalQuizzes = userQuizzes.length
    const scores = userQuizzes.map(attempt => attempt.score)
    const averageScore = totalQuizzes > 0 
      ? scores.reduce((a, b) => a + b, 0) / totalQuizzes 
      : 0

    // Calculate weekly increase
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weeklyQuizIncrease = userQuizzes.filter(
      attempt => new Date(attempt.completed_at) > oneWeekAgo
    ).length

    // Get user ranking based on average scores
    const userRankings = await sql`
      WITH user_averages AS (
        SELECT 
          u.id,
          u.email,
          COUNT(uqp.id) as total_quizzes,
          CASE 
            WHEN COUNT(uqp.id) > 0 THEN AVG(uqp.score)
            ELSE 0
          END as avg_score
        FROM users u
        LEFT JOIN user_quiz_progress uqp ON u.id = uqp.user_id AND uqp.completed = true
        GROUP BY u.id, u.email
      ),
      user_ranks AS (
        SELECT 
          id,
          email,
          total_quizzes,
          avg_score,
          RANK() OVER (ORDER BY avg_score DESC) as rank
        FROM user_averages
      )
      SELECT * FROM user_ranks
      WHERE email = ${session.user.email}
    `

    const userRank = userRankings[0]?.rank || 0

    // Get total number of users for percentile calculation
    const totalUsers = await sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE email IS NOT NULL
    `
    const rankingPercentile = (userRank / totalUsers[0].count) * 100

    // Calculate achievements
    const achievements = []

    // Quiz Master - Complete 10 quizzes with 80% or higher
    const highScoreQuizzes = userQuizzes.filter(q => {
      const percentage = (q.score / 100) * 100
      return percentage >= 80
    })
    achievements.push({
      ...ACHIEVEMENT_TYPES.QUIZ_MASTER,
      progress: Math.min((highScoreQuizzes.length / ACHIEVEMENT_TYPES.QUIZ_MASTER.requirement) * 100, 100),
      completed: highScoreQuizzes.length >= ACHIEVEMENT_TYPES.QUIZ_MASTER.requirement,
      completedAt: highScoreQuizzes.length >= ACHIEVEMENT_TYPES.QUIZ_MASTER.requirement ? new Date() : null
    })

    // Quick Learner - Complete 5 quizzes in a single day
    const today = new Date()
    const quizzesToday = userQuizzes.filter(q => {
      const attemptDate = new Date(q.completed_at)
      return attemptDate.toDateString() === today.toDateString()
    })
    achievements.push({
      ...ACHIEVEMENT_TYPES.QUICK_LEARNER,
      progress: Math.min((quizzesToday.length / ACHIEVEMENT_TYPES.QUICK_LEARNER.requirement) * 100, 100),
      completed: quizzesToday.length >= ACHIEVEMENT_TYPES.QUICK_LEARNER.requirement,
      completedAt: quizzesToday.length >= ACHIEVEMENT_TYPES.QUICK_LEARNER.requirement ? new Date() : null
    })

    // Perfect Score - Get 100% on any quiz
    const perfectScores = userQuizzes.filter(q => q.score === 100)
    achievements.push({
      ...ACHIEVEMENT_TYPES.PERFECT_SCORE,
      progress: perfectScores.length > 0 ? 100 : 0,
      completed: perfectScores.length > 0,
      completedAt: perfectScores.length > 0 ? new Date() : null
    })

    // Dedicated Learner - Complete quizzes for 5 consecutive days
    let maxConsecutiveDays = 0
    if (userQuizzes.length > 0) {
      const dates = [...new Set(userQuizzes.map(q => new Date(q.completed_at).toDateString()))]
      dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      
      let consecutiveDays = 1
      maxConsecutiveDays = 1
      
      for (let i = 1; i < dates.length; i++) {
        const current = new Date(dates[i])
        const prev = new Date(dates[i - 1])
        const dayDifference = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDifference === 1) {
          consecutiveDays++
          maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays)
        } else {
          consecutiveDays = 1
        }
      }
    }
    
    achievements.push({
      ...ACHIEVEMENT_TYPES.DEDICATED_LEARNER,
      progress: Math.min((maxConsecutiveDays / ACHIEVEMENT_TYPES.DEDICATED_LEARNER.requirement) * 100, 100),
      completed: maxConsecutiveDays >= ACHIEVEMENT_TYPES.DEDICATED_LEARNER.requirement,
      completedAt: maxConsecutiveDays >= ACHIEVEMENT_TYPES.DEDICATED_LEARNER.requirement ? new Date() : null
    })

    // Knowledge Seeker - Complete quizzes in 3 different categories
    const uniqueCategories = [...new Set(userQuizzes.map(q => q.category))]
    achievements.push({
      ...ACHIEVEMENT_TYPES.KNOWLEDGE_SEEKER,
      progress: Math.min((uniqueCategories.length / ACHIEVEMENT_TYPES.KNOWLEDGE_SEEKER.requirement) * 100, 100),
      completed: uniqueCategories.length >= ACHIEVEMENT_TYPES.KNOWLEDGE_SEEKER.requirement,
      completedAt: uniqueCategories.length >= ACHIEVEMENT_TYPES.KNOWLEDGE_SEEKER.requirement ? new Date() : null
    })

    const stats = {
      totalQuizzes,
      averageScore,
      weeklyQuizIncrease,
      scoreImprovement: averageScore - (userQuizzes[0]?.score || 0),
      ranking: userRank,
      rankingPercentile,
      achievements: {
        completed: achievements.filter(a => a.completed).length,
        total: achievements.length,
        recent: achievements.filter(
          a => a.completed && a.completedAt && new Date(a.completedAt) > oneWeekAgo
        ).length
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[USER_STATS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 