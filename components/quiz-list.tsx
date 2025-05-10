"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Award } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Mock data - would be replaced with actual API call
const mockQuizzes = [
  {
    id: 1,
    title: "World Geography",
    description: "Test your knowledge of countries, capitals, and landmarks",
    difficulty: "Medium",
    timeLimit: 15,
    participants: 2453,
    imageUrl: "/placeholder.svg?height=200&width=400",
    category: "Geography",
  },
  {
    id: 2,
    title: "Science Trivia",
    description: "Explore the wonders of physics, chemistry, and biology",
    difficulty: "Hard",
    timeLimit: 20,
    participants: 1876,
    imageUrl: "/placeholder.svg?height=200&width=400",
    category: "Science",
  },
  {
    id: 3,
    title: "Pop Culture",
    description: "How well do you know movies, music, and celebrities?",
    difficulty: "Easy",
    timeLimit: 10,
    participants: 3241,
    imageUrl: "/placeholder.svg?height=200&width=400",
    category: "Entertainment",
  },
  {
    id: 4,
    title: "History Buff",
    description: "Journey through time with historical events and figures",
    difficulty: "Medium",
    timeLimit: 15,
    participants: 1987,
    imageUrl: "/placeholder.svg?height=200&width=400",
    category: "History",
  },
  {
    id: 5,
    title: "Tech Wizards",
    description: "Test your knowledge of computers, gadgets, and innovation",
    difficulty: "Hard",
    timeLimit: 20,
    participants: 1543,
    imageUrl: "/placeholder.svg?height=200&width=400",
    category: "Technology",
  },
  {
    id: 6,
    title: "Sports Champions",
    description: "From football to cricket, test your sports knowledge",
    difficulty: "Medium",
    timeLimit: 15,
    participants: 2765,
    imageUrl: "/placeholder.svg?height=200&width=400",
    category: "Sports",
  },
]

export function QuizList() {
  const [quizzes, setQuizzes] = useState(mockQuizzes)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <div>Loading quizzes...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz, index) => (
        <motion.div
          key={quiz.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="quiz-card h-full overflow-hidden border-2 hover:border-purple-400 dark:hover:border-purple-500 transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src={quiz.imageUrl || "/placeholder.svg"}
                alt={quiz.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute top-4 right-4">
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
              </div>
              <div className="absolute top-4 left-4">
                <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80">
                  {quiz.category}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{quiz.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{quiz.timeLimit} min</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{quiz.participants.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  <span>50 pts</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
