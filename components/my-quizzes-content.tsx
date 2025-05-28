"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, Edit, Trash2, Clock, Award, BarChart2 } from "lucide-react"
import Link from "next/link"

interface Quiz {
  id: number
  title: string
  description: string
  category?: string
  difficulty?: string
  created_at: string
  creator_name?: string
}

interface CreatedQuiz extends Quiz {
  questions?: number
  participants?: number
}

interface InProgressQuiz extends Quiz {
  progress: number
  last_played: string
}

interface CompletedQuiz extends Quiz {
  score: number
  completed_at: string
  correct_answers?: number
  total_questions?: number
}

export function MyQuizzesContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [createdQuizzes, setCreatedQuizzes] = useState<CreatedQuiz[]>([])
  const [inProgressQuizzes, setInProgressQuizzes] = useState<InProgressQuiz[]>([])
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchUserQuizzes()
    }
  }, [status, router, session])

  const fetchUserQuizzes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all user's quiz data
      const [createdRes, progressRes, historyRes] = await Promise.all([
        fetch(`/api/user/quizzes/created?userId=${session?.user?.id}`),
        fetch(`/api/user/quizzes/progress?userId=${session?.user?.id}`),
        fetch(`/api/user/quizzes/history?userId=${session?.user?.id}`)
      ])

      if (!createdRes.ok || !progressRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch quiz data')
      }

      const [created, progress, history] = await Promise.all([
        createdRes.json(),
        progressRes.json(),
        historyRes.json()
      ])

      setCreatedQuizzes(created)
      setInProgressQuizzes(progress)
      setCompletedQuizzes(history)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      setError('Failed to load quizzes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return
    }

    try {
      const response = await fetch(`/api/user/quizzes/${quizId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete quiz')
      }

      // Refresh the data
      fetchUserQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz. Please try again.')
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchUserQuizzes}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      <Tabs defaultValue="created" className="space-y-8">
        <TabsList>
          <TabsTrigger value="created">Created ({createdQuizzes.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressQuizzes.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedQuizzes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="created">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="h-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                  <PlusCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Create New Quiz</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Design your own quiz with custom questions and answers
                  </p>
                  <Button asChild>
                    <Link href="/create-quiz">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {createdQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (index + 1) * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                      </div>
                      {quiz.category && (
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          {quiz.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {quiz.questions && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Questions</span>
                          <span>{quiz.questions}</span>
                        </div>
                      )}
                      {quiz.participants && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Participants</span>
                          <span>{quiz.participants}</span>
                        </div>
                      )}
                      {quiz.difficulty && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Difficulty</span>
                          <Badge 
                            variant={quiz.difficulty === 'easy' ? 'default' : quiz.difficulty === 'medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {quiz.difficulty}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/edit-quiz/${quiz.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {createdQuizzes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven&apos;t created any quizzes yet.</p>
              <Button asChild>
                <Link href="/create-quiz">Create Your First Quiz</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                      </div>
                      {quiz.category && (
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          {quiz.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="text-sm font-medium">{Math.round(quiz.progress)}%</span>
                        </div>
                        <Progress value={quiz.progress} className="h-2" />
                      </div>
                      {quiz.difficulty && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Difficulty</span>
                          <Badge 
                            variant={quiz.difficulty === 'easy' ? 'default' : quiz.difficulty === 'medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {quiz.difficulty}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Last played</span>
                        <span>{new Date(quiz.last_played).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}`}>Continue Quiz</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {inProgressQuizzes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You don&apos;t have any quizzes in progress.</p>
              <Button asChild>
                <Link href="/quizzes">Browse Quizzes</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                      </div>
                      <Badge
                        className={`ml-2 shrink-0 ${
                          quiz.score >= 80 ? "bg-green-500" : quiz.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                      >
                        {quiz.score}%
                      </Badge>
                    </div>
                    {quiz.category && (
                      <Badge variant="outline" className="w-fit mt-2">
                        {quiz.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-2">
                            <Award className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                          <div className="font-medium">{quiz.score}%</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
                          <div className="font-medium">
                            {quiz.correct_answers || 0}/{quiz.total_questions || 0}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 mb-2">
                            <BarChart2 className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
                          <div className="font-medium text-xs">
                            {quiz.difficulty || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Completed on {new Date(quiz.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/quizzes/${quiz.id}/results`}>View Results</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/quizzes/${quiz.id}`}>Retry Quiz</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {completedQuizzes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven&apos;t completed any quizzes yet.</p>
              <Button asChild>
                <Link href="/quizzes">Browse Quizzes</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}