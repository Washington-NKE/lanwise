
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getUserQuizHistory } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user ID from session
    const userId = session.user.id

    // Get all quiz history for the user
    const quizHistory = await getUserQuizHistory(userId)
    
    return NextResponse.json(quizHistory)
  } catch (error) {
    console.error("Error fetching quiz history:", error)
    return NextResponse.json({ message: "Error fetching quiz history" }, { status: 500 })
  }
}