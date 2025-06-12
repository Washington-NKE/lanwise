"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trophy, Medal, Award } from "lucide-react"

interface LeaderboardUser {
  id: number
  name: string
  image?: string
  quizzes_completed: number
  total_score: number
  rank: number
}

export function LeaderboardContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPeriod, setCurrentPeriod] = useState("all-time")

  // Fetch leaderboard data based on period
  const fetchLeaderboard = async (period: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/leaderboard?period=${period}&limit=100`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }
      
      setUsers(data.data)
      setFilteredUsers(data.data)
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard data")
      setUsers([])
      setFilteredUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard(currentPeriod)
  }, [currentPeriod])

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(
        users.filter((user) => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, users])

  // Handle tab change
  const handlePeriodChange = (period: string) => {
    setCurrentPeriod(period)
    setSearchTerm("") // Clear search when changing periods
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchLeaderboard(currentPeriod)}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No quiz results yet for {currentPeriod === 'all-time' ? 'all time' : `this ${currentPeriod.replace('-', ' ')}`}. 
            Be the first to complete a quiz!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2" />
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl">Global Rankings</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentPeriod} onValueChange={handlePeriodChange} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all-time">All Time</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
            
            <TabsContent value={currentPeriod}>
              <div className="space-y-4 mt-4">
                {/* Top 3 users with special styling */}
                {filteredUsers.slice(0, 3).map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <div
                        className={`h-1 ${
                          index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                        }`}
                      />
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 mr-4">
                            {index === 0 ? (
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            ) : index === 1 ? (
                              <Medal className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Award className="h-5 w-5 text-amber-700" />
                            )}
                          </div>
                          <div className="flex-1 flex items-center">
                            <Avatar className="h-12 w-12 mr-4">
                              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.quizzes_completed} quizzes completed
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{user.total_score.toLocaleString()}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">points</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Remaining users in table format */}
                {filteredUsers.length > 3 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden mt-6">
                    <div className="grid grid-cols-12 text-sm font-medium p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="col-span-1 text-center">Rank</div>
                      <div className="col-span-6">User</div>
                      <div className="col-span-2 text-center">Quizzes</div>
                      <div className="col-span-3 text-right">Score</div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.slice(3).map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: (index + 3) * 0.05 }}
                          className="grid grid-cols-12 items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="col-span-1 text-center font-medium">{user.rank}</div>
                          <div className="col-span-6 flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.name}</div>
                          </div>
                          <div className="col-span-2 text-center">{user.quizzes_completed}</div>
                          <div className="col-span-3 text-right font-medium">{user.total_score.toLocaleString()}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Load More button - you can implement pagination here */}
                {users.length >= 100 && (
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={() => fetchLeaderboard(currentPeriod)}>
                      Refresh Data
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top Performers - Show only if we have users */}
      {users.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            Top Performers - {currentPeriod === 'all-time' ? 'All Time' : currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["🏆 Champion", "🥈 Runner-up", "🥉 Third Place"].map((title, index) => {
              const user = filteredUsers[index]
              if (!user) return null
              
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Badge className="mr-2">{title}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.total_score.toLocaleString()} points
                          </div>
                        </div>
                        {index === 0 ? (
                          <Trophy className="h-6 w-6 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Award className="h-6 w-6 text-amber-700" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}