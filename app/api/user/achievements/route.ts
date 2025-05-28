import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserByEmail, sql } from "@/lib/db"

const ACHIEVEMENT_TYPES = {
  QUIZ_MASTER: {
    title: "Quiz Master",
    description: "Complete 10 quizzes with a score of 80% or higher",
    iconName: "Trophy",
    requirement: 10
  },
  QUICK_LEARNER: {
    title: "Quick Learner",
    description: "Complete 5 quizzes in a single day",
    iconName: "Clock",
    requirement: 5
  },
  PERFECT_SCORE: {
    title: "Perfect Score",
    description: "Get a 100% score on any quiz",
    iconName: "Award",
    requirement: 1
  },
  DEDICATED_LEARNER: {
    title: "Dedicated Learner",
    description: "Complete quizzes for 5 consecutive days",
    iconName: "Target",
    requirement: 5
  },
  KNOWLEDGE_SEEKER: {
    title: "Knowledge Seeker",
    description: "Complete quizzes in 3 different categories",
    iconName: "BookOpen",
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

    // Get all user quiz attempts with quiz details
    const userQuizzes = await sql`
      SELECT 
        uqp.id,
        uqp.score,
        uqp.completed_at,
        q.id as quiz_id,
        q.title,
        q.category,
        q.difficulty,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as total_questions
      FROM user_quiz_progress uqp
      JOIN quizzes q ON uqp.quiz_id = q.id
      WHERE uqp.user_id = ${user.id} 
        AND uqp.completed = true
      ORDER BY uqp.completed_at DESC
    `

    // Calculate achievement progress
    const achievements = []

    // Quiz Master - Complete 10 quizzes with 80% or higher
    const highScoreQuizzes = userQuizzes.filter(q => {
      const percentage = (q.score / 100) * 100 // Assuming score is already a percentage
      return percentage >= 80
    })
    achievements.push({
      ...ACHIEVEMENT_TYPES.QUIZ_MASTER,
      progress: Math.min((highScoreQuizzes.length / ACHIEVEMENT_TYPES.QUIZ_MASTER.requirement) * 100, 100),
      completed: highScoreQuizzes.length >= ACHIEVEMENT_TYPES.QUIZ_MASTER.requirement
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
      completed: quizzesToday.length >= ACHIEVEMENT_TYPES.QUICK_LEARNER.requirement
    })

    // Perfect Score - Get 100% on any quiz
    const perfectScores = userQuizzes.filter(q => q.score === 100)
    achievements.push({
      ...ACHIEVEMENT_TYPES.PERFECT_SCORE,
      progress: perfectScores.length > 0 ? 100 : 0,
      completed: perfectScores.length > 0
    })

    // Dedicated Learner - Complete quizzes for 5 consecutive days
    let maxConsecutiveDays = 0
    if (userQuizzes.length > 0) {
      const dates = [...new Set(userQuizzes.map(q => new Date(q.completed_at).toDateString()))]
      dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Sort chronologically
      
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
      completed: maxConsecutiveDays >= ACHIEVEMENT_TYPES.DEDICATED_LEARNER.requirement
    })

    // Knowledge Seeker - Complete quizzes in 3 different categories
    const uniqueCategories = [...new Set(userQuizzes.map(q => q.category))]
    achievements.push({
      ...ACHIEVEMENT_TYPES.KNOWLEDGE_SEEKER,
      progress: Math.min((uniqueCategories.length / ACHIEVEMENT_TYPES.KNOWLEDGE_SEEKER.requirement) * 100, 100),
      completed: uniqueCategories.length >= ACHIEVEMENT_TYPES.KNOWLEDGE_SEEKER.requirement
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("[ACHIEVEMENTS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}