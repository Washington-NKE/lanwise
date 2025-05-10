import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { saveUserAnswer, getUserById } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { questionId, answerId, isCorrect, timeTaken } = await req.json()

    if (
      typeof questionId !== "number" ||
      typeof answerId !== "number" ||
      typeof isCorrect !== "boolean" ||
      typeof timeTaken !== "number"
    ) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    // Get user ID from session
    const user = await getUserById(Number.parseInt(session.user.id))
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Save answer
    const userAnswer = await saveUserAnswer(user.id, questionId, answerId, isCorrect, timeTaken)

    return NextResponse.json({ message: "Answer saved successfully", userAnswer })
  } catch (error) {
    console.error("Error saving answer:", error)
    return NextResponse.json({ message: "Error saving answer" }, { status: 500 })
  }
}
