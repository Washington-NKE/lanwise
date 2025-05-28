"use client"

import React from "react"
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

// Types for API responses
type UserQuiz = {
  id: number
  title: string
  score: number
  date: string
  correctAnswers: number
  totalQuestions: number
}

type Achievement = {
  id: number
  title: string
  description: string
  progress: number
  completed: boolean
  icon: any
}

type RecommendedQuiz = {
  id: number
  title: string
  description: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
}

type UserStats = {
  totalQuizzes: number
  averageScore: number
  weeklyQuizIncrease: number
  scoreImprovement: number
  ranking: number
  rankingPercentile: number
  achievements: {
    completed: number
    total: number
    recent: number
  }
}

export function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  // State for real data
  const [recentQuizzes, setRecentQuizzes] = useState<UserQuiz[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [recommendedQuizzes, setRecommendedQuizzes] = useState<RecommendedQuiz[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Map achievement icons
  const achievementIcons = {
    "Trophy": Trophy,
    "Award": Award,
    "Target": Target,
    "BookOpen": BookOpen,
    "Clock": Clock
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user) {
      fetchDashboardData()
    }
  }, [status, router, session])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch user stats
      const statsResponse = await fetch('/api/user/stats')
      if (!statsResponse.ok) throw new Error('Failed to fetch user stats')
      const statsData = await statsResponse.json()

      setUserStats(statsData)
      
      // Fetch recent quizzes
      const recentQuizzesResponse = await fetch('/api/user/quizzes/recent')
      if (!recentQuizzesResponse.ok) throw new Error('Failed to fetch recent quizzes')
      const recentQuizzesData = await recentQuizzesResponse.json()
      setRecentQuizzes(recentQuizzesData)
      
      // Fetch achievements
      const achievementsResponse = await fetch('/api/user/achievements')
      if (!achievementsResponse.ok) throw new Error('Failed to fetch achievements')
      const achievementsData = await achievementsResponse.json()
      // Map the string icon names to actual components
      const processedAchievements = achievementsData.map(achievement => ({
        ...achievement,
        icon: achievementIcons[achievement.iconName as keyof typeof achievementIcons] || Award
      }))
      setAchievements(processedAchievements)
      
      const recommendedResponse = await fetch('/api/user/quizzes/recommended')
      if (!recommendedResponse.ok) throw new Error('Failed to fetch recommended quizzes')
      const recommendedData = await recommendedResponse.json()
      setRecommendedQuizzes(recommendedData)
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
        <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
        <Button 
          variant="outline" 
          className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
          onClick={fetchDashboardData}
        >
          Retry
        </Button>
      </div>
    )
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
                  <CardTitle className="text-3xl">{userStats?.totalQuizzes || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    <span>+{userStats?.weeklyQuizIncrease || 0} this week</span>
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
                  <CardTitle className="text-3xl">{userStats?.averageScore || 0}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <BarChart2 className="h-4 w-4 mr-1 text-purple-500" />
                    <span>+{userStats?.scoreImprovement || 0}% improvement</span>
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
                  <CardTitle className="text-3xl">
                    {userStats?.achievements.completed || 0}/{userStats?.achievements.total || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>{userStats?.achievements.recent || 0} new unlocked</span>
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
                  <CardTitle className="text-3xl">#{userStats?.ranking || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Target className="h-4 w-4 mr-1 text-blue-500" />
                    <span>Top {userStats?.rankingPercentile || 0}%</span>
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
                  {recentQuizzes.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <p>You haven't taken any quizzes yet.</p>
                      <Button className="mt-4" asChild>
                        <Link href="/quizzes">Find Quizzes</Link>
                      </Button>
                    </div>
                  )}
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
                  {achievements.length > 0 ? (
                    <div className="space-y-6">
                      {achievements.slice(0, 3).map((achievement) => {
                        const AchievementIcon = achievement.icon;
                        return (
                          <div key={achievement.id} className="space-y-2">
                            <div className="flex items-center">
                              <div className="mr-3">
                                <AchievementIcon className="h-5 w-5 text-yellow-500" />
                              </div>
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
                        );
                      })}
                      <Button variant="outline" asChild className="w-full">
                        <Link href="#achievements">View All Achievements</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <p>No achievements yet. Complete quizzes to earn achievements!</p>
                    </div>
                  )}
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
                {recommendedQuizzes.length > 0 ? (
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
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>No recommendations yet. Take more quizzes to get personalized recommendations!</p>
                    <Button className="mt-4" asChild>
                      <Link href="/quizzes">Browse Quizzes</Link>
                    </Button>
                  </div>
                )}
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
                {/* Quiz history tab content will be implemented with API data */}
                <QuizHistoryTab />
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
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((achievement) => {
                    const AchievementIcon = achievement.icon;
                    return (
                      <Card key={achievement.id} className="overflow-hidden">
                        <div className={`h-1 ${achievement.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`} />
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div className="mr-4">
                              <AchievementIcon className="h-6 w-6 text-yellow-500" />
                            </div>
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
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No achievements yet. Complete quizzes to earn achievements!</p>
                  <Button className="mt-4" asChild>
                    <Link href="/quizzes">Find Quizzes</Link>
                  </Button>
                </div>
              )}
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
              {/* Using the RecommendedQuizzesTab component */}
              <RecommendedQuizzesTab quizzes={recommendedQuizzes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Component for the quiz history tab
function QuizHistoryTab() {
  const [quizHistory, setQuizHistory] = useState<UserQuiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuizHistory() {
      try {
        const response = await fetch('/api/user/quizzes/history')
        if (!response.ok) throw new Error('Failed to fetch quiz history')
        const data = await response.json()
        setQuizHistory(data)
      } catch (err) {
        console.error("Error fetching quiz history:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizHistory()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></div>
  }

  if (error) {
    return <div className="text-red-500">Error loading quiz history: {error}</div>
  }

  if (quizHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">You haven't taken any quizzes yet.</p>
        <Button className="mt-4" asChild>
          <Link href="/quizzes">Find Quizzes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {quizHistory.map((quiz) => (
        <Card key={quiz.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="font-medium text-lg">{quiz.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(quiz.date).toLocaleDateString()} at {new Date(quiz.date).toLocaleTimeString()}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <Badge className={quiz.score >= 70 ? "bg-green-500" : quiz.score >= 50 ? "bg-yellow-500" : "bg-red-500"}>
                  Score: {quiz.score}%
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={quiz.score} className="h-2" />
              <div className="flex justify-between text-sm mt-1 text-gray-500 dark:text-gray-400">
                <span>{quiz.correctAnswers} correct of {quiz.totalQuestions} questions</span>
                <Link
                  href={`/quizzes/${quiz.id}/results`}
                  className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Component for the recommended quizzes tab
function RecommendedQuizzesTab({ quizzes }: { quizzes: RecommendedQuiz[] }) {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">No recommendations yet. Take more quizzes to get personalized recommendations!</p>
        <Button className="mt-4" asChild>
          <Link href="/quizzes">Browse Quizzes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
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
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/quizzes/${quiz.id}/details`}>Details</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/quizzes/${quiz.id}`}>Start</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}