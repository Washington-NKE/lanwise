import { NextResponse } from "next/server"
import { getAllQuizzes } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const search = searchParams.get("search")
    const timeMin = searchParams.get("timeMin")
    const timeMax = searchParams.get("timeMax")

    // Get all quizzes from the database
    const quizzes = await getAllQuizzes()

    // Apply filters if provided
    let filteredQuizzes = quizzes

    if (category) {
      const categories = category.split(",")
      filteredQuizzes = filteredQuizzes.filter((quiz) => categories.includes(quiz.category))
    }

    if (difficulty) {
      const difficulties = difficulty.split(",")
      filteredQuizzes = filteredQuizzes.filter((quiz) => difficulties.includes(quiz.difficulty))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredQuizzes = filteredQuizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchLower) || quiz.description.toLowerCase().includes(searchLower),
      )
    }

    if (timeMin && timeMax) {
      filteredQuizzes = filteredQuizzes.filter(
        (quiz) => quiz.time_limit >= Number.parseInt(timeMin) && quiz.time_limit <= Number.parseInt(timeMax),
      )
    }

    return NextResponse.json(filteredQuizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ message: "Error fetching quizzes" }, { status: 500 })
  }
}
