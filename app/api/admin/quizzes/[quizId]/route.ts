import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { quizId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const quizId = parseInt(params.quizId)
    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }
    try {
      await sql`BEGIN`;
      await sql`DELETE FROM user_answers WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})`;
      await sql`DELETE FROM user_quiz_progress WHERE quiz_id = ${quizId}`;
      await sql`DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ${quizId})`;
      await sql`DELETE FROM questions WHERE quiz_id = ${quizId}`;
      await sql`DELETE FROM quizzes WHERE id = ${quizId}`;
      await sql`COMMIT`;
    } catch (err) {
      await sql`ROLLBACK`;
      throw err;
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export function GET() { return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 }) }
export function POST() { return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 }) }
export function PUT() { return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 }) } 