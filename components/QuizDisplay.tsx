"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Copy, Check } from "lucide-react"
import confetti from "canvas-confetti"
import { QuizResults } from "@/components/quiz-results"

// Define types to match the API response structure
type Answer = {
  id: number
  question_id: number
  answer_text: string
  is_correct: boolean
}

type Question = {
  id: number
  quiz_id: number
  question: string
  image_url: string | null
  points: number
  time_limit: number
  order_num: number
  answers?: Answer[]
}

type Quiz = {
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

export function QuizGame({ quizId }: { quizId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState('')

  // Fetch quiz data from the database
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setIsLoading(true)
        const quizResponse = await fetch(`/api/quizzes/${quizId}`)
        
        if (!quizResponse.ok) {
          throw new Error(`Failed to fetch quiz: ${quizResponse.status}`)
        }
        
        const quizData = await quizResponse.json()
        setQuiz(quizData)
        setTimeLeft(quizData.time_limit * 60)
      } catch (err) {
        console.error("Error fetching quiz:", err)
        setError(err instanceof Error ? err.message : "Failed to load quiz")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId])

  // Set up timer
  useEffect(() => {
    if (isLoading || quizCompleted || !quiz) return

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
  }, [isLoading, quizCompleted, quiz])

  // Function to render formatted text with syntax highlighting
  const renderFormattedText = (text: string) => {
    if (!text) return ''
    
    // Split text by code blocks
    const parts = text.split(/```(\w+)?\n([\s\S]*?)```/g)
    
    return parts.map((part, index) => {
      // If it's a code block (every 3rd element starting from index 2)
      if (index % 3 === 2) {
        const language = parts[index - 1] || 'text'
        return (
          <div key={index} className="relative group my-6">
            <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-sm">
              <span className="font-medium">{language.toUpperCase()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-gray-400 hover:text-white"
                onClick={() => handleCopyCode(part)}
              >
                {copiedCode === part ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 rounded-b-lg p-4 overflow-x-auto border-t border-gray-700">
              <code className={`language-${language} text-sm leading-relaxed`}>
                {part}
              </code>
            </pre>
          </div>
        )
      }
      // If it's the language identifier, skip it
      else if (index % 3 === 1) {
        return null
      }
      // Regular text
      else {
        return (
          <div key={index} className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {part}
          </div>
        )
      }
    })
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleAnswerSelect = (answer: Answer) => {
    if (isAnswerSubmitted) return
    setSelectedAnswer(answer)
  }

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || isAnswerSubmitted || !quiz) return

    setIsAnswerSubmitted(true)
    const currentQuestion = quiz.questions[currentQuestionIndex]
    const isCorrect = selectedAnswer.is_correct

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
      [currentQuestion.id]: selectedAnswer.id.toString(),
    }))
  }

  const handleNextQuestion = () => {
    if (!quiz) return
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      handleQuizEnd()
    }
  }

  const handleQuizEnd = async () => {
    setQuizCompleted(true)
    
    if (!quiz || !session?.user) return
    
    // Save the quiz results to the database
    try {
      const response = await fetch('/api/quiz-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz_id: quiz.id,
          user_id: session.user.email,
          score: score,
          time_taken: quiz.time_limit * 60 - timeLeft,
          answers: userAnswers
        }),
      })
      
      if (!response.ok) {
        console.error('Failed to save quiz results')
      }
    } catch (err) {
      console.error('Error saving quiz results:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 rounded-md text-red-700">
        <h3 className="font-semibold mb-2">Error loading quiz</h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/quizzes')}
        >
          Return to Quizzes
        </Button>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Quiz not found</h3>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/quizzes')}
        >
          Return to Quizzes
        </Button>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <QuizResults 
        quiz={quiz} 
        score={score} 
        userAnswers={userAnswers} 
        timeTaken={quiz.time_limit * 60 - timeLeft} 
      />
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600 dark:text-gray-300">{quiz.description}</p>
      </div>

      {/* Progress and Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
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
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Score: {score} points
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

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentQuestionIndex + 1}</span>
              <Badge variant="outline">{currentQuestion.points} points</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text with Code Formatting */}
            <div className="prose dark:prose-invert max-w-none">
              {renderFormattedText(currentQuestion.question)}
            </div>

            {/* Question Image */}
            {currentQuestion.image_url && (
              <div className="relative h-[300px] w-full">
                <Image 
                  src={currentQuestion.image_url} 
                  alt="Question illustration" 
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
            )}
            
            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.answers?.map((answer, index) => (
                <motion.div
                  key={answer.id}
                  whileHover={{ scale: isAnswerSubmitted ? 1 : 1.02 }}
                  whileTap={{ scale: isAnswerSubmitted ? 1 : 0.98 }}
                  onClick={() => handleAnswerSelect(answer)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${
                      selectedAnswer?.id === answer.id
                        ? isAnswerSubmitted
                          ? answer.is_correct
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    }
                    ${isAnswerSubmitted && answer.is_correct ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}
                    ${!isAnswerSubmitted ? "hover:shadow-md" : ""}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{answer.answer_text}</span>
                    </div>
                    {isAnswerSubmitted && selectedAnswer?.id === answer.id && (
                      <div>
                        {answer.is_correct ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                    )}
                    {isAnswerSubmitted && answer.is_correct && selectedAnswer?.id !== answer.id && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Button */}
      <div className="flex justify-center">
        {!isAnswerSubmitted ? (
          <Button 
            onClick={handleAnswerSubmit} 
            disabled={!selectedAnswer} 
            size="lg"
            className="px-8 py-3 text-lg"
          >
            Submit Answer
          </Button>
        ) : (
          <Button 
            onClick={handleNextQuestion}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </div>
  )
}