import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please add it to your .env.local file."
  )
}

// Create a SQL client with the connection string
const sql = neon(process.env.DATABASE_URL)

export { sql }


export async function getAllUsers() {
  try {
    const users = await sql`
      SELECT 
        id,
        name,
        email,
        image,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `
    return users
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}

export async function getUserById(id: number) {
  try {
    const [user] = await sql`
      SELECT * FROM users WHERE id = ${id}
    `
    return user
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return user
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export async function createUser(name: string, email: string, password: string, image?: string) {
  try {
    const [user] = await sql`
      INSERT INTO users (name, email, password, image)
      VALUES (${name}, ${email}, ${password}, ${image})
      RETURNING *
    `
    return user
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(id: number, updates: Partial<{
  name: string
  email: string
  image: string
  password: string
}>) {
  try {
    // Build the SET clause properly
    const setFields = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = $${key}`)
      .join(', ')
    
    if (setFields.length === 0) {
      throw new Error('No fields to update')
    }
    
    // Create the values object for the query
    const values = { ...updates, id }
    
    const [user] = await sql`
      UPDATE users 
      SET ${sql.unsafe(setFields)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return user
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export async function deleteUser(id: number) {
  try {
    // First delete related records to maintain referential integrity
    await sql`DELETE FROM user_answers WHERE user_id = ${id}`
    await sql`DELETE FROM user_quiz_progress WHERE user_id = ${id}`
    
    // Then delete the user
    const [deletedUser] = await sql`
      DELETE FROM users 
      WHERE id = ${id}
      RETURNING *
    `
    return deletedUser
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export async function createUserWithOAuth(
  name: string,
  email: string,
  image?: string,
  provider?: string,
  providerId?: string
) {
  try {
    const [user] = await sql`
      INSERT INTO users (name, email, image, oauth_provider, oauth_provider_id)
      VALUES (${name}, ${email}, ${image}, ${provider}, ${providerId})
      RETURNING *
    `
    return user
  } catch (error) {
    console.error("Error creating OAuth user:", error)
    throw error
  }
}

export async function getAllQuizzes() {
  try {
    const quizzes = await sql`
      SELECT q.*, u.name as creator_name
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC
    `
    return quizzes
  } catch (error) {
    console.error("Error getting all quizzes:", error)
    throw error
  }
}

export async function getQuizById(id: number) {
  try {
    const [quiz] = await sql`
      SELECT q.*, u.name as creator_name
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = ${id}
    `
    return quiz
  } catch (error) {
    console.error("Error getting quiz by ID:", error)
    throw error
  }
}

export async function getQuizQuestions(quizId: number) {
  try {
    const questions = await sql`
      SELECT * FROM questions
      WHERE quiz_id = ${quizId}
      ORDER BY order_num ASC
    `
    return questions
  } catch (error) {
    console.error("Error getting quiz questions:", error)
    throw error
  }
}

export async function getQuestionAnswers(questionId: number) {
  try {
    const answers = await sql`
      SELECT * FROM answers
      WHERE question_id = ${questionId}
    `
    return answers
  } catch (error) {
    console.error("Error getting question answers:", error)
    throw error
  }
}

export async function deleteQuiz(id: number) {
  try {
    // Delete in proper order to maintain referential integrity
    // First get all questions for this quiz
    const questions = await sql`SELECT id FROM questions WHERE quiz_id = ${id}`
    
    // Delete answers for all questions in this quiz
    for (const question of questions) {
      await sql`DELETE FROM answers WHERE question_id = ${question.id}`
      await sql`DELETE FROM user_answers WHERE question_id = ${question.id}`
    }
    
    // Delete questions
    await sql`DELETE FROM questions WHERE quiz_id = ${id}`
    
    // Delete user progress for this quiz
    await sql`DELETE FROM user_quiz_progress WHERE quiz_id = ${id}`
    
    // Finally delete the quiz
    const [deletedQuiz] = await sql`
      DELETE FROM quizzes 
      WHERE id = ${id}
      RETURNING *
    `
    return deletedQuiz
  } catch (error) {
    console.error("Error deleting quiz:", error)
    throw error
  }
}

export async function getUserQuizProgress(userId: number, quizId: number) {
  try {
    const [progress] = await sql`
      SELECT * FROM user_quiz_progress
      WHERE user_id = ${userId} AND quiz_id = ${quizId}
    `
    return progress
  } catch (error) {
    console.error("Error getting user quiz progress:", error)
    throw error
  }
}

export async function createOrUpdateUserQuizProgress(
  userId: number,
  quizId: number,
  score: number,
  completed: boolean,
) {
  try {
    const completedAt = completed ? new Date() : null
    const [progress] = await sql`
      INSERT INTO user_quiz_progress (user_id, quiz_id, score, completed, completed_at)
      VALUES (${userId}, ${quizId}, ${score}, ${completed}, ${completedAt})
      ON CONFLICT (user_id, quiz_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        completed = EXCLUDED.completed,
        completed_at = EXCLUDED.completed_at
      RETURNING *
    `
    return progress
  } catch (error) {
    console.error("Error creating/updating user quiz progress:", error)
    throw error
  }
}

export async function saveUserAnswer(
  userId: number,
  questionId: number,
  answerId: number,
  isCorrect: boolean,
  timeTaken: number,
) {
  try {
    const [userAnswer] = await sql`
      INSERT INTO user_answers (user_id, question_id, answer_id, is_correct, time_taken)
      VALUES (${userId}, ${questionId}, ${answerId}, ${isCorrect}, ${timeTaken})
      ON CONFLICT (user_id, question_id)
      DO UPDATE SET
        answer_id = EXCLUDED.answer_id,
        is_correct = EXCLUDED.is_correct,
        time_taken = EXCLUDED.time_taken
      RETURNING *
    `
    return userAnswer
  } catch (error) {
    console.error("Error saving user answer:", error)
    throw error
  }
}

export async function getLeaderboard(period = 'all-time', limit = 100) {
  try {
    // If running on client side, use fetch to API route
    if (typeof window !== 'undefined') {
      const response = await fetch(`/api/leaderboard?period=${period}&limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }
      return data.data
    }

    // If running on server side, use direct database query
    let leaderboardData

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

    return leaderboardData.map((row, index) => ({
      id: row.id,
      name: row.name,
      image: row.image,
      quizzes_completed: parseInt(row.quizzes_completed.toString()),
      total_score: parseInt(row.total_score.toString()),
      rank: index + 1
    }))

  } catch (error) {
    console.error("Error getting leaderboard:", error)
    throw error
  }
}

export async function getUserRecentQuizzes(userId: string, limit: number = 10) {
  try {
    const quizzes = await sql`
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        uqp.score,
        uqp.completed,
        uqp.completed_at
      FROM quizzes q
      JOIN user_quiz_progress uqp ON q.id = uqp.quiz_id
      WHERE uqp.user_id = ${userId}
      ORDER BY uqp.completed_at DESC
      LIMIT ${limit}
    `
    return quizzes
  } catch (error) {
    console.error("Error getting user recent quizzes:", error)
    throw error
  }
}

export async function getUserQuizHistory(userId: string) {
  try {
    const quizzes = await sql`
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
      WHERE uqp.user_id = ${userId} 
        AND uqp.completed = true
      ORDER BY uqp.completed_at DESC
    `

    return quizzes.map(attempt => ({
      id: attempt.quiz_id,
      title: attempt.title,
      score: attempt.score,
      date: attempt.date,
      correctAnswers: attempt.correct_answers,
      totalQuestions: attempt.total_questions,
      category: attempt.category,
      difficulty: attempt.difficulty
    }))
  } catch (error) {
    console.error("Error getting user quiz history:", error)
    throw error
  }
}