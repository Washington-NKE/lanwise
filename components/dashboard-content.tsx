"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, BarChart2, Clock, Trophy, TrendingUp, BookOpen, Target } from "lucide-react"
import Link from "next/link"

// Mock data - would be replaced with actual API calls
const recentQuizzes = [
  {
    id: 1,
    title: "World Geography",
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    date: "2023-05-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Science Trivia",
    score: 60,
    totalQuestions: 10,
    correctAnswers: 6,
    date: "2023-05-10T14:20:00Z",
  },
  {
    id: 3,
    title: "History Buff",
    score: 90,
    totalQuestions: 10,
    correctAnswers: 9,
    date: "2023-05-05T09:15:00Z",
  },
]

const achievements = [
  {
    id: 1,
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    progress: 30,
    icon: <Trophy className="h-8 w-8 text-yellow-500" />,
  },
  {
    id: 2,
    title: "Perfect Score",
    description: "Get 100% on any quiz",
    progress: 0,
    icon: <Award className="h-8 w-8 text-purple-500" />,
  },
  {
    id: 3,
    title: "Speed Demon",
    description: "Complete a quiz in under 2 minutes",
    progress: 100,
    icon: <Clock className="h-8 w-8 text-blue-500" />,
    completed: true,
  },
  {
    id: 4,
    title: "Knowledge Seeker",
    description: "Try quizzes from 5 different categories",
    progress: 60,
    icon: <BookOpen className="h-8 w-8 text-green-500" />,
  },
]

const recommendedQuizzes = [
  {
    id: 1,
    title: "Pop Culture",
    description: "Test your knowledge of movies, music, and celebrities",
    difficulty: "Easy",
    category: "Entertainment",
  },
  {
    id: 2,
    title: "Tech Wizards",
    description: "All about computers, gadgets, and innovation",
    difficulty: "Hard",
    category: "Technology",
  },
  {
    id: 3,
    title: "Sports Champions",
    description: "From football to cricket, test your sports knowledge",
    difficulty: "Medium",
    category: "Sports",
  },
]

export function DashboardContent() {
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
    return <div>Loading dashboard...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {session.user?.name || "User"}!</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your progress and discover new quizzes</p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Quizzes</CardDescription>
                  <CardTitle className="text-3xl">12</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    <span>+3 this week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Score</CardDescription>
                  <CardTitle className="text-3xl">76%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <BarChart2 className="h-4 w-4 mr-1 text-purple-500" />
                    <span>+5% improvement</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Achievements</CardDescription>
                  <CardTitle className="text-3xl">7/20</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>1 new unlocked</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Ranking</CardDescription>
                  <CardTitle className="text-3xl">#42</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Target className="h-4 w-4 mr-1 text-blue-500" />
                    <span>Top 15%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Recent Quizzes</CardTitle>
                  <CardDescription>Your latest quiz results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{quiz.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(quiz.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            Score: {quiz.score}% ({quiz.correctAnswers}/{quiz.totalQuestions})
                          </div>
                          <Link
                            href={`/quizzes/${quiz.id}/results`}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                          >
                            View Details
                          </Link>
                        </div>
                        <Progress value={quiz.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                  <CardDescription>Your progress towards achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="space-y-2">
                        <div className="flex items-center">
                          <div className="mr-3">{achievement.icon}</div>
                          <div>
                            <div className="font-medium flex items-center">
                              {achievement.title}
                              {achievement.completed && <Badge className="ml-2 bg-green-500">Completed</Badge>}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</div>
                          </div>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    ))}
                    <Button variant="outline" asChild className="w-full">
                      <Link href="#achievements">View All Achievements</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recommended Quizzes</CardTitle>
                <CardDescription>Based on your interests and quiz history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="overflow-hidden">
                      <div
                        className={`h-1 ${
                          quiz.difficulty === "Easy"
                            ? "bg-green-500"
                            : quiz.difficulty === "Medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <CardContent className="p-4">
                        <div className="font-medium mb-1">{quiz.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{quiz.description}</div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs font-normal">
                            {quiz.category}
                          </Badge>
                          <Button size="sm" asChild>
                            <Link href={`/quizzes/${quiz.id}`}>Start</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
              <CardDescription>All quizzes you've taken, with scores and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quiz history content would go here */}
                <p>Your quiz history will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" id="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Track your progress and unlock achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="overflow-hidden">
                    <div className={`h-1 ${achievement.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`} />
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="mr-4">{achievement.icon}</div>
                        <div>
                          <div className="font-medium flex items-center">
                            {achievement.title}
                            {achievement.completed && <Badge className="ml-2 bg-green-500">Completed</Badge>}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</div>
                          <Progress value={achievement.progress} className="h-2 mt-2" />
                          <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                            {achievement.progress}% complete
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommended">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Quizzes</CardTitle>
              <CardDescription>Quizzes tailored to your interests and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Recommended quizzes content would go here */}
                <p>Your recommended quizzes will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
