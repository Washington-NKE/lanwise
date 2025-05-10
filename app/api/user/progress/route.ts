import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createOrUpdateUserQuizProgress, getUserById } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { quizId, score, completed } = await req.json()

    if (typeof quizId !== "number" || typeof score !== "number" || typeof completed !== "boolean") {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    // Get user ID from session
    const userEmail = session.user.email
    if (!userEmail) {
      return NextResponse.json({ message: "User email not found" }, { status: 400 })
    }

    const user = await getUserById(Number.parseInt(session.user.id))
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Save progress
    const progress = await createOrUpdateUserQuizProgress(user.id, quizId, score, completed)

    return NextResponse.json({ message: "Progress saved successfully", progress })
  } catch (error) {
    console.error("Error saving progress:", error)
    return NextResponse.json({ message: "Error saving progress" }, { status: 500 })
  }
}
