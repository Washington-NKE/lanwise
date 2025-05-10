"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Award } from "lucide-react"
import Link from "next/link"

const quizzes = [
  {
    id: 1,
    title: "World Geography",
    description: "Test your knowledge of countries, capitals, and landmarks",
    difficulty: "Medium",
    timeLimit: 15,
    participants: 2453,
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "Science Trivia",
    description: "Explore the wonders of physics, chemistry, and biology",
    difficulty: "Hard",
    timeLimit: 20,
    participants: 1876,
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "Pop Culture",
    description: "How well do you know movies, music, and celebrities?",
    difficulty: "Easy",
    timeLimit: 10,
    participants: 3241,
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
]

export function FeaturedQuizzes() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Featured <span className="gradient-text">Quizzes</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our most popular quizzes and challenge yourself today
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" asChild>
            <Link href="/quizzes">View All Quizzes</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
