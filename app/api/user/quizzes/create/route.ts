import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      isPublic,
      questions
    } = body;

    // Validate required fields
    if (!title || !description || !category || !difficulty || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text || !question.options || question.options.length === 0) {
        return NextResponse.json(
          { error: `Question ${i + 1} is missing text or options` },
          { status: 400 }
        );
      }

      // Check if at least one option is marked as correct
      const hasCorrectAnswer = question.options.some((option: any) => option.isCorrect);
      if (!hasCorrectAnswer) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have at least one correct answer` },
          { status: 400 }
        );
      }

      // Check if all options have text
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text) {
          return NextResponse.json(
            { error: `Question ${i + 1}, option ${j + 1} is missing text` },
            { status: 400 }
          );
        }
      }
    }

    // Get the user ID from the database
    const [user] = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create the quiz
    const [createdQuiz] = await sql`
      INSERT INTO quizzes (
        title, 
        description, 
        category,
        difficulty, 
        time_limit, 
        is_public,
        created_by,
        created_at,
        updated_at
      )
      VALUES (
        ${title},
        ${description},
        ${category},
        ${difficulty},
        ${timeLimit},
        ${isPublic || false},
        ${user.id},
        NOW(),
        NOW()
      )
      RETURNING id, title, description, category, difficulty, time_limit, is_public, created_at
    `;

    // Add questions and their answers
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const [createdQuestion] = await sql`
        INSERT INTO questions (
          quiz_id,
          question,
          order_num,
          points,
          time_limit,
          image_url,
          explanation
        )
        VALUES (
          ${createdQuiz.id},
          ${question.text},
          ${i + 1},
          ${question.points || 10},
          ${question.timeLimit || 30},
          ${question.imageUrl || null},
          ${question.explanation || null}
        )
        RETURNING id
      `;

      // Add answer options for this question
      for (const option of question.options) {
        await sql`
          INSERT INTO answers (
            question_id,
            answer_text,
            is_correct
          )
          VALUES (
            ${createdQuestion.id},
            ${option.text},
            ${option.isCorrect}
          )
        `;
      }
    }

    // Return the created quiz with success message
    return NextResponse.json({
      message: "Quiz created successfully",
      quiz: {
        id: createdQuiz.id,
        title: createdQuiz.title,
        description: createdQuiz.description,
        category: createdQuiz.category,
        difficulty: createdQuiz.difficulty,
        timeLimit: createdQuiz.time_limit,
        isPublic: createdQuiz.is_public,
        createdAt: createdQuiz.created_at,
        questionCount: questions.length
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to retrieve quizzes for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Get user's quizzes
    const quizzes = await sql`
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.time_limit,
        q.is_public,
        q.created_at,
        q.updated_at,
        COUNT(quest.id) as question_count
      FROM quizzes q
      LEFT JOIN questions quest ON q.id = quest.quiz_id
      JOIN users u ON q.created_by = u.id
      WHERE u.email = ${session.user.email}
      GROUP BY q.id, q.title, q.description, q.category, q.difficulty, q.time_limit, q.is_public, q.created_at, q.updated_at
      ORDER BY q.created_at DESC
    `;

    return NextResponse.json({ quizzes });

  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}