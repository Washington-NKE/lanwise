// app/api/user/quizzes/[quizId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sql } from '@/lib/db'

// GET handler to fetch quiz data for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId: quizIdParam } = await params
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizId = parseInt(quizIdParam)
    const userId = parseInt(session.user.id)

    if (isNaN(quizId)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 })
    }

    // Check if quiz exists and user owns it
    const quizResult = await sql`
      SELECT * FROM quizzes WHERE id = ${quizId} AND created_by = ${userId}
    `

    if (quizResult.length === 0) {
      return NextResponse.json({ error: 'Quiz not found or you don\'t have permission to edit it' }, { status: 404 })
    }

    const quiz = quizResult[0]

    // Fetch questions for this quiz
    const questionsResult = await sql`
      SELECT * FROM questions WHERE quiz_id = ${quizId} ORDER BY order_num
    `

    // Fetch answers for each question
    const questions = []
    for (const question of questionsResult) {
      const answersResult = await sql`
        SELECT * FROM answers WHERE question_id = ${question.id} ORDER BY id
      `
      
      questions.push({
        id: question.id,
        text: question.text,
        type: question.type || 'text',
        language: question.language,
        points: question.points || 10,
        timeLimit: question.time_limit || 30,
        imageUrl: question.image_url,
        explanation: question.explanation,
        options: answersResult.map(answer => ({
          id: answer.id,
          text: answer.text,
          isCorrect: answer.is_correct
        }))
      })
    }

    const formattedQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      timeLimit: quiz.time_limit,
      isPublic: quiz.is_public,
      questions
    }

    return NextResponse.json({ quiz: formattedQuiz })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId: quizIdParam } = await params
    console.log('DELETE request received for quizId:', quizIdParam)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizId = parseInt(quizIdParam)
    const userId = parseInt(session.user.id) // Convert to number for comparison

    console.log('Parsed quizId:', quizId, 'userId:', userId)

    // Validate quizId is a valid number
    if (isNaN(quizId)) {
      console.log('Invalid quizId: not a number')
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 })
    }

    // Check if user owns the quiz
    const quizResult = await sql`
      SELECT created_by FROM quizzes WHERE id = ${quizId}
    `

    console.log('Quiz query result:', quizResult)

    if (quizResult.length === 0) {
      console.log('Quiz not found in database')
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const quiz = quizResult[0]
    if (quiz.created_by !== userId) {
      console.log('User does not own this quiz. Quiz owner:', quiz.created_by, 'Current user:', userId, 'Types:', typeof quiz.created_by, typeof userId)
      return NextResponse.json({ error: 'Unauthorized to delete this quiz' }, { status: 403 })
    }

    // Delete quiz and related data using transaction
    try {
      await sql`BEGIN`;
      // Delete user answers first
      await sql`
        DELETE FROM user_answers 
        WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})
      `;
      await sql`DELETE FROM user_quiz_progress WHERE quiz_id = ${quizId}`;
      await sql`
        DELETE FROM answers 
        WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})
      `;
      await sql`DELETE FROM questions WHERE quiz_id = ${quizId}`;
      await sql`DELETE FROM quizzes WHERE id = ${quizId}`;
      await sql`COMMIT`;
    } catch (err) {
      await sql`ROLLBACK`;
      throw err;
    }

    console.log('Quiz deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId: quizIdParam } = await params 
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const quizId = parseInt(quizIdParam) // Fixed: use quizIdParam instead of params.id

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      isPublic,
      questions,
    } = body

    // Validation
    if (!title || !description || !category || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      )
    }

    // Validate questions
    for (const question of questions) {
      if (!question.text || !question.options || question.options.length < 2) {
        return NextResponse.json(
          { error: "Each question must have text and at least 2 options" },
          { status: 400 }
        )
      }

      const correctOptions = question.options.filter((opt: any) => opt.isCorrect)
      if (correctOptions.length !== 1) {
        return NextResponse.json(
          { error: "Each question must have exactly one correct answer" },
          { status: 400 }
        )
      }

      for (const option of question.options) {
        if (!option.text) {
          return NextResponse.json(
            { error: "All options must have text" },
            { status: 400 }
          )
        }
      }
    }

    // Check if quiz exists and user owns it
    const quizResult = await sql`
      SELECT * FROM quizzes WHERE id = ${quizId} AND created_by = ${session.user.id}
    `;
    if (quizResult.length === 0) {
      return NextResponse.json({ error: "Quiz not found or you don't have permission to edit it" }, { status: 404 });
    }

    // Use transaction to update quiz, questions, and answers
    try {
      await sql`BEGIN`;

      // Update quiz details
      await sql`
        UPDATE quizzes SET
          title = ${title},
          description = ${description},
          category = ${category},
          difficulty = ${difficulty},
          time_limit = ${timeLimit},
          is_public = ${isPublic},
          updated_at = NOW()
        WHERE id = ${quizId}
      `;

      // Delete existing questions and answers (consistent with DELETE function)
      await sql`
        DELETE FROM user_answers 
        WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})
      `;
      await sql`
        DELETE FROM answers 
        WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})
      `;
      await sql`DELETE FROM questions WHERE quiz_id = ${quizId}`;

      // Insert new questions and answers
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionRes = await sql`
          INSERT INTO questions (quiz_id, text, type, language, points, time_limit, image_url, explanation, order_num)
          VALUES (${quizId}, ${q.text}, ${q.type || 'multiple_choice'}, ${q.language || null}, ${q.points || 10}, ${q.timeLimit || 30}, ${q.imageUrl || null}, ${q.explanation || null}, ${i})
          RETURNING id
        `;
        const questionId = questionRes[0].id;
        
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await sql`
            INSERT INTO answers (question_id, text, is_correct)
            VALUES (${questionId}, ${opt.text}, ${opt.isCorrect})
          `;
        }
      }

      await sql`COMMIT`;

      return NextResponse.json({ success: true, message: "Quiz updated successfully" });
    } catch (error) {
      await sql`ROLLBACK`;
      console.error("Transaction error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}