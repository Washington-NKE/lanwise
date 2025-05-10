import { NextResponse } from "next/server"
import { getQuestionAnswers } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string; questionId: string } }) {
  try {
    const questionId = Number.parseInt(params.questionId)
    if (isNaN(questionId)) {
      return NextResponse.json({ message: "Invalid question ID" }, { status: 400 })
    }

    // Get question answers
    const answers = await getQuestionAnswers(questionId)

    return NextResponse.json(answers)
  } catch (error) {
    console.error("Error fetching question answers:", error)
    return NextResponse.json({ message: "Error fetching question answers" }, { status: 500 })
  }
}
