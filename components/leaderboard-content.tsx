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

// Mock data - would be replaced with actual API call
const users = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 9850,
    quizzesCompleted: 42,
    rank: 1,
  },
  {
    id: 2,
    name: "Sarah Williams",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 9320,
    quizzesCompleted: 38,
    rank: 2,
  },
  {
    id: 3,
    name: "Michael Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 8970,
    quizzesCompleted: 35,
    rank: 3,
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 8540,
    quizzesCompleted: 33,
    rank: 4,
  },
  {
    id: 5,
    name: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 8120,
    quizzesCompleted: 30,
    rank: 5,
  },
  {
    id: 6,
    name: "Jessica Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 7890,
    quizzesCompleted: 28,
    rank: 6,
  },
  {
    id: 7,
    name: "Daniel Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 7650,
    quizzesCompleted: 27,
    rank: 7,
  },
  {
    id: 8,
    name: "Olivia Martin",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 7320,
    quizzesCompleted: 25,
    rank: 8,
  },
  {
    id: 9,
    name: "James Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 7100,
    quizzesCompleted: 24,
    rank: 9,
  },
  {
    id: 10,
    name: "Sophia Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 6950,
    quizzesCompleted: 23,
    rank: 10,
  },
]

export function LeaderboardContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(users)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(users.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase())))
    }
  }, [searchTerm])

  if (isLoading) {
    return <div>Loading leaderboard...</div>
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
          <Tabs defaultValue="all-time" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all-time">All Time</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
            <TabsContent value="all-time">
              <div className="space-y-4 mt-4">
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
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.quizzesCompleted} quizzes completed
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{user.score.toLocaleString()}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">points</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

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
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{user.name}</div>
                        </div>
                        <div className="col-span-2 text-center">{user.quizzesCompleted}</div>
                        <div className="col-span-3 text-right font-medium">{user.score.toLocaleString()}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button variant="outline">Load More</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="monthly">
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Monthly rankings will be displayed here.</p>
              </div>
            </TabsContent>
            <TabsContent value="weekly">
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Weekly rankings will be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Category Champions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Science", "History", "Geography"].map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Badge className="mr-2">{category}</Badge>
                    Champion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={users[index].avatar || "/placeholder.svg"} alt={users[index].name} />
                      <AvatarFallback>{users[index].name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{users[index].name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.floor(users[index].score / 2).toLocaleString()} points
                      </div>
                    </div>
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
