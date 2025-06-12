import { NextResponse } from "next/server"
import { getAllUsers } from "@/lib/db"

export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
  }
}

export function POST() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 })
}

export function PUT() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 })
}

export function DELETE() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 })
} 