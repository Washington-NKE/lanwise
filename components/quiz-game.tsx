"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import confetti from "canvas-confetti"
import { QuizResults } from "@/components/quiz-results"

// Define types to match the new API response structure
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
  const [loadingQuestions, setLoadingQuestions] = useState<Record<number, boolean>>({})

  // Fetch quiz data from the database
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setIsLoading(true)
        // Get the quiz details with questions using the combined endpoint
        const quizResponse = await fetch(`/api/quizzes/${quizId}`)
        
        if (!quizResponse.ok) {
          throw new Error(`Failed to fetch quiz: ${quizResponse.status}`)
        }
        
        const quizData = await quizResponse.json()
        setQuiz(quizData)
        setTimeLeft(quizData.time_limit * 60)
        
        // Create initial loading state for all questions
        const loadingState = quizData.questions.reduce((acc: Record<number, boolean>, question: Question) => {
          acc[question.id] = false;
          return acc;
        }, {});
        setLoadingQuestions(loadingState);
        
        // Fetch answers for the first question immediately
        if (quizData.questions.length > 0) {
          fetchQuestionAnswers(quizData.questions[0].id);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err)
        setError(err instanceof Error ? err.message : "Failed to load quiz")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId])

  // Fetch answers for a specific question
  const fetchQuestionAnswers = async (questionId: number) => {
    if (!quiz) return;
    
    try {
      setLoadingQuestions(prev => ({ ...prev, [questionId]: true }));
      
      const answersResponse = await fetch(`/api/quizzes/${quizId}/questions/${questionId}/route`)
      
      if (!answersResponse.ok) {
        throw new Error(`Failed to fetch answers: ${answersResponse.status}`)
      }
      
      const answersData = await answersResponse.json()
      
      // Update the quiz object with the answers for this question
      setQuiz(prevQuiz => {
        if (!prevQuiz) return null;
        
        const updatedQuestions = prevQuiz.questions.map(q => {
          if (q.id === questionId) {
            return { ...q, answers: answersData }
          }
          return q;
        });
        
        return { ...prevQuiz, questions: updatedQuestions };
      });
    } catch (err) {
      console.error(`Error fetching answers for question ${questionId}:`, err);
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [questionId]: false }));
    }
  }

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

  // Prefetch next question's answers
  useEffect(() => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length - 1) return;
    
    const nextQuestionId = quiz.questions[currentQuestionIndex + 1].id;
    if (!quiz.questions[currentQuestionIndex + 1].answers) {
      fetchQuestionAnswers(nextQuestionId);
    }
  }, [currentQuestionIndex, quiz]);

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
      [currentQuestion.id]: selectedAnswer.id.toString(), // This stores answer ID
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
  const isLoadingAnswers = loadingQuestions[currentQuestion.id] || !currentQuestion.answers

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
            
            {currentQuestion.image_url && (
              <div className="mb-6 relative h-[300px] w-full">
                <Image 
                  src={currentQuestion.image_url} 
                  alt="Question illustration" 
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
            )}
            
            {isLoadingAnswers ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestion.answers?.map((answer, index) => (
                  <motion.div
                    key={answer.id}
                    whileHover={{ scale: isAnswerSubmitted ? 1 : 1.02 }}
                    whileTap={{ scale: isAnswerSubmitted ? 1 : 0.98 }}
                    onClick={() => handleAnswerSelect(answer)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        selectedAnswer?.id === answer.id
                          ? isAnswerSubmitted
                            ? answer.is_correct
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                      }
                      ${isAnswerSubmitted && answer.is_correct ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{answer.answer_text}</span>
                      </div>
                      {isAnswerSubmitted && selectedAnswer?.id === answer.id && (
                        <div>
                          {answer.is_correct ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                      {isAnswerSubmitted && answer.is_correct && selectedAnswer?.id !== answer.id && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-between">
        {!isAnswerSubmitted ? (
          <Button 
            onClick={handleAnswerSubmit} 
            disabled={!selectedAnswer || isLoadingAnswers} 
            className="w-full py-6 text-lg"
          >
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