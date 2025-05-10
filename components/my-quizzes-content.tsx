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

// Mock data - would be replaced with actual API calls
const createdQuizzes = [
  {
    id: 1,
    title: "Science Trivia",
    description: "Test your knowledge of physics, chemistry, and biology",
    questions: 10,
    participants: 156,
    createdAt: "2023-05-10T14:20:00Z",
  },
  {
    id: 2,
    title: "Movie Quotes",
    description: "Can you identify these famous movie quotes?",
    questions: 15,
    participants: 89,
    createdAt: "2023-04-22T09:15:00Z",
  },
]

const inProgressQuizzes = [
  {
    id: 3,
    title: "World Geography",
    description: "Test your knowledge of countries, capitals, and landmarks",
    progress: 30,
    lastPlayed: "2023-05-15T10:30:00Z",
  },
  {
    id: 4,
    title: "History Buff",
    description: "Journey through time with historical events and figures",
    progress: 60,
    lastPlayed: "2023-05-12T16:45:00Z",
  },
]

const completedQuizzes = [
  {
    id: 5,
    title: "Pop Culture",
    description: "How well do you know movies, music, and celebrities?",
    score: 80,
    completedAt: "2023-05-08T11:20:00Z",
  },
  {
    id: 6,
    title: "Tech Wizards",
    description: "Test your knowledge of computers, gadgets, and innovation",
    score: 65,
    completedAt: "2023-05-01T15:10:00Z",
  },
]

export function MyQuizzesContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [status, router])

  if (status === "loading" || isLoading) {
    return <div>Loading quizzes...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <Tabs defaultValue="created" className="space-y-8">
        <TabsList>
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
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
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Questions</span>
                        <span>{quiz.questions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Participants</span>
                        <span>{quiz.participants}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Created</span>
                        <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
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
                    <Button variant="destructive" size="sm">
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
              <p className="text-gray-500 dark:text-gray-400">You haven&apos;t created any quizzes yet.</p>
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
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="text-sm font-medium">{quiz.progress}%</span>
                        </div>
                        <Progress value={quiz.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Last played</span>
                        <span>{new Date(quiz.lastPlayed).toLocaleDateString()}</span>
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
              <p className="text-gray-500 dark:text-gray-400">You don&apos;t have any quizzes in progress.</p>
              <Button className="mt-4" asChild>
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
                      <CardTitle>{quiz.title}</CardTitle>
                      <Badge
                        className={`${
                          quiz.score >= 80 ? "bg-green-500" : quiz.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                      >
                        {quiz.score}%
                      </Badge>
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
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
                          <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
                          <div className="font-medium">5:30</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 mb-2">
                            <BarChart2 className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Rank</div>
                          <div className="font-medium">#42</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Completed on {new Date(quiz.completedAt).toLocaleDateString()}
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
              <p className="text-gray-500 dark:text-gray-400">You haven&apos;t completed any quizzes yet.</p>
              <Button className="mt-4" asChild>
                <Link href="/quizzes">Browse Quizzes</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
