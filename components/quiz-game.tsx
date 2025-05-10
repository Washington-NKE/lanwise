"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import confetti from "canvas-confetti"
import { QuizResults } from "@/components/quiz-results"

// Mock quiz data - would be replaced with actual API call
const mockQuiz = {
  id: "1",
  title: "World Geography",
  description: "Test your knowledge of countries, capitals, and landmarks",
  difficulty: "Medium",
  timeLimit: 15,
  totalQuestions: 10,
  questions: [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      points: 10,
    },
    {
      id: 2,
      question: "Which is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correctAnswer: "Pacific Ocean",
      points: 10,
    },
    {
      id: 3,
      question: "Which country is known as the Land of the Rising Sun?",
      options: ["China", "Japan", "Thailand", "South Korea"],
      correctAnswer: "Japan",
      points: 10,
    },
    {
      id: 4,
      question: "The Great Barrier Reef is located in which country?",
      options: ["Brazil", "Australia", "Indonesia", "Mexico"],
      correctAnswer: "Australia",
      points: 10,
    },
    {
      id: 5,
      question: "Which desert is the largest in the world?",
      options: ["Gobi Desert", "Kalahari Desert", "Sahara Desert", "Antarctic Desert"],
      correctAnswer: "Antarctic Desert",
      points: 10,
    },
  ],
}

export function QuizGame({ quizId }: { quizId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [quiz, setQuiz] = useState(mockQuiz)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  useEffect(() => {
    // Simulate API call to fetch quiz data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [quizId])

  useEffect(() => {
    if (isLoading || quizCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleQuizEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLoading, quizCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerSubmitted) return
    setSelectedAnswer(answer)
  }

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || isAnswerSubmitted) return

    setIsAnswerSubmitted(true)
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    if (isCorrect) {
      setScore((prev) => prev + currentQuestion.points)
      // Trigger confetti for correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      handleQuizEnd()
    }
  }

  const handleQuizEnd = () => {
    setQuizCompleted(true)
    // Here you would typically save the results to the database
  }

  if (isLoading) {
    return <div>Loading quiz...</div>
  }

  if (quizCompleted) {
    return (
      <QuizResults quiz={quiz} score={score} userAnswers={userAnswers} timeTaken={quiz.timeLimit * 60 - timeLeft} />
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600 dark:text-gray-300">{quiz.description}</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Badge
            className={`
              ${quiz.difficulty === "Easy" ? "bg-green-500" : ""}
              ${quiz.difficulty === "Medium" ? "bg-yellow-500" : ""}
              ${quiz.difficulty === "Hard" ? "bg-red-500" : ""}
              text-white font-medium
            `}
          >
            {quiz.difficulty}
          </Badge>
          <span className="ml-4 text-sm font-medium">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
          <span className={`text-sm font-medium ${timeLeft < 60 ? "text-red-500 animate-pulse" : ""}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <Progress value={progress} className="mb-8" />

      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Card className="border-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: isAnswerSubmitted ? 1 : 1.02 }}
                  whileTap={{ scale: isAnswerSubmitted ? 1 : 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      selectedAnswer === option
                        ? isAnswerSubmitted
                          ? option === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                    }
                    ${isAnswerSubmitted && option === currentQuestion.correctAnswer ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                    {isAnswerSubmitted && option === selectedAnswer && (
                      <div>
                        {option === currentQuestion.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                    {isAnswerSubmitted && option === currentQuestion.correctAnswer && option !== selectedAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-between">
        {!isAnswerSubmitted ? (
          <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer} className="w-full py-6 text-lg">
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} className="w-full py-6 text-lg">
            {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </div>
  )
}
