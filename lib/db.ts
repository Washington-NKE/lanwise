import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// User functions
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

// Quiz functions
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

// User progress functions
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
    const [progress] = await sql`
      INSERT INTO user_quiz_progress (user_id, quiz_id, score, completed, completed_at)
      VALUES (${userId}, ${quizId}, ${score}, ${completed}, ${completed ? new Date() : null})
      ON CONFLICT (user_id, quiz_id)
      DO UPDATE SET
        score = ${score},
        completed = ${completed},
        completed_at = ${completed ? new Date() : null}
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
        answer_id = ${answerId},
        is_correct = ${isCorrect},
        time_taken = ${timeTaken}
      RETURNING *
    `
    return userAnswer
  } catch (error) {
    console.error("Error saving user answer:", error)
    throw error
  }
}

// Leaderboard functions
export async function getLeaderboard() {
  try {
    const leaderboard = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.image,
        COUNT(DISTINCT uqp.quiz_id) as quizzes_completed,
        SUM(uqp.score) as total_score
      FROM users u
      JOIN user_quiz_progress uqp ON u.id = uqp.user_id
      WHERE uqp.completed = true
      GROUP BY u.id, u.name, u.image
      ORDER BY total_score DESC
      LIMIT 100
    `
    return leaderboard
  } catch (error) {
    console.error("Error getting leaderboard:", error)
    throw error
  }
}
