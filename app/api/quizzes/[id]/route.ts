import { NextResponse } from "next/server"
import { getQuizById, getQuizQuestions } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const quizId = Number.parseInt(params.id)
    if (isNaN(quizId)) {
      return NextResponse.json({ message: "Invalid quiz ID" }, { status: 400 })
    }

    // Get quiz details
    const quiz = await getQuizById(quizId)
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 })
    }

    // Get quiz questions
    const questions = await getQuizQuestions(quizId)

    // Combine quiz and questions
    const quizWithQuestions = {
      ...quiz,
      questions,
    }

    return NextResponse.json(quizWithQuestions)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ message: "Error fetching quiz" }, { status: 500 })
  }
}
