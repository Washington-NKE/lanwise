"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Trophy, Clock, BarChart, Share2 } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

interface Answer {
  id: number
  question_id: number
  answer_text: string
  is_correct: boolean
}

interface Question {
  id: number
  quiz_id: number
  question: string
  image_url: string | null
  points: number
  time_limit: number
  order_num: number
  answers?: Answer[]
}

interface Quiz {
  id: number
  title: string
  description: string
  image_url: string
  difficulty: string
  time_limit: number
  created_by: number
  created_at: string
  creator_name: string
  questions: Question[]
}

interface QuizResultsProps {
  quiz: Quiz
  score: number
  userAnswers: Record<number, string> // question_id -> answer_id (as string)
  timeTaken: number
}

export function QuizResults({ quiz, score, userAnswers, timeTaken }: QuizResultsProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const maxScore = quiz.questions.reduce((acc: number, q: Question) => acc + q.points, 0)
  const percentage = Math.round((score / maxScore) * 100)
  
  // Helper function to get correct answer for a question
  const getCorrectAnswer = (question: Question): Answer | null => {
    return question.answers?.find(answer => answer.is_correct) || null
  }
  
  // Helper function to get user's selected answer for a question
  const getUserSelectedAnswer = (question: Question): Answer | null => {
    const userAnswerId = userAnswers[question.id]
    if (!userAnswerId) return null
    return question.answers?.find(answer => answer.id === parseInt(userAnswerId)) || null
  }
  
  // Calculate correct answers count
  const correctAnswers = quiz.questions.filter((question) => {
    const userAnswerId = userAnswers[question.id]
    if (!userAnswerId) return false
    
    const correctAnswer = getCorrectAnswer(question)
    return correctAnswer && correctAnswer.id === parseInt(userAnswerId)
  }).length

  useEffect(() => {
    if (showConfetti && percentage >= 70) {
      const duration = 3 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#9c27b0", "#3b82f6", "#ec4899"],
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#9c27b0", "#3b82f6", "#ec4899"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()

      setTimeout(() => {
        setShowConfetti(false)
      }, duration)
    }
  }, [showConfetti, percentage])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getResultMessage = () => {
    if (percentage >= 90) return "Outstanding!"
    if (percentage >= 70) return "Great job!"
    if (percentage >= 50) return "Good effort!"
    return "Keep practicing!"
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
        <p className="text-gray-600 dark:text-gray-300">{quiz.title}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="mb-8 overflow-hidden border-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2" />
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{getResultMessage()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-yellow-500" />
                  </div>
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray="352"
                      strokeDashoffset={352 - (352 * percentage) / 100}
                      className="text-purple-500"
                    />
                  </svg>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold">{percentage}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{correctAnswers}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Correct</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-2">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold">{quiz.questions.length - correctAnswers}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Incorrect</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-2">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{formatTime(timeTaken)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-2">
                    <BarChart className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {score}/{maxScore}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Points</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Button asChild>
                <Link href="/quizzes">More Quizzes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/quizzes/${quiz.id}/review`}>Review Answers</Link>
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4">Question Summary</h2>
        <div className="space-y-4">
          {quiz.questions.map((question: Question, index: number) => {
            const userSelectedAnswer = getUserSelectedAnswer(question)
            const correctAnswer = getCorrectAnswer(question)
            const isCorrect = userSelectedAnswer && correctAnswer && userSelectedAnswer.id === correctAnswer.id
            
            return (
              <Card key={question.id} className="overflow-hidden">
                <div
                  className={`h-1 ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
                />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {index + 1}. {question.question}
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Your answer: </span>
                        <span
                          className={
                            isCorrect
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {userSelectedAnswer?.answer_text || "Not answered"}
                        </span>
                      </div>
                      {!isCorrect && correctAnswer && (
                        <div className="mt-1 text-sm">
                          <span className="font-medium">Correct answer: </span>
                          <span className="text-green-600 dark:text-green-400">
                            {correctAnswer.answer_text}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isCorrect
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}