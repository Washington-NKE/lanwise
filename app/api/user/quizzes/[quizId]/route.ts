// app/api/user/quizzes/[quizId]/route.ts
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const quizId = parseInt(params.id)

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

    // Use transaction to update quiz, questions, and options
    try {
      await sql`BEGIN`;

      // 2. Update quiz details
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

      // 3. Delete existing questions and options
      await sql`DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})`;
      await sql`DELETE FROM questions WHERE quiz_id = ${quizId}`;

      // 4. Insert new questions and options
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionRes = await sql`
          INSERT INTO questions (quiz_id, text, type, language, points, time_limit, image_url, explanation, "order")
          VALUES (${quizId}, ${q.text}, ${q.type || 'text'}, ${q.language || null}, ${q.points || 10}, ${q.timeLimit || 30}, ${q.imageUrl || null}, ${q.explanation || null}, ${i})
          RETURNING id
        `;
        const questionId = questionRes[0].id;
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await sql`
            INSERT INTO options (question_id, text, is_correct, "order")
            VALUES (${questionId}, ${opt.text}, ${opt.isCorrect}, ${j})
          `;
        }
      }

      await sql`COMMIT`;

      // Optionally, fetch and return the updated quiz with questions/options here

      return NextResponse.json({ success: true, message: "Quiz updated successfully" });
    } catch (error) {
      await sql`ROLLBACK`;
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
