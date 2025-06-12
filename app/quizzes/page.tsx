'use client'

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import QuizFilters from "@/components/quiz-filters"
import QuizList from "@/components/quiz-list"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

// Define the Quiz type to match your API response format
export type Quiz = {
  id: number
  title: string
  description: string
  difficulty: string
  time_limit: number
  image_url: string
  created_by: number
  created_at: string
  creator_name: string
  category: string
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<[number, number]>([1, 120])

  // Extract unique difficulties from loaded quizzes
  const difficulties = useMemo(() => {
    const uniqueDifficulties = [...new Set(quizzes.map(quiz => quiz.difficulty).filter(Boolean))]
    return uniqueDifficulties.sort()
  }, [quizzes])

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/quizzes')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch quizzes: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("API response:", data)
        
        if (Array.isArray(data)) {
          setQuizzes(data)
        } else {
          console.error("Invalid data format received:", data)
          setError("Received invalid data format from server")
          setQuizzes([])
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err)
        setError(err instanceof Error ? err.message : "Failed to load quizzes")
        setQuizzes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  // Filter logic
  const filteredQuizzes = useMemo(() => {
    let filtered = quizzes

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.creator_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter (you might need to add category field to your quiz data)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(quiz => selectedCategories.includes(quiz.category))
    }

    // Difficulty filter
    if (selectedDifficulties.length > 0) {
      filtered = filtered.filter(quiz => selectedDifficulties.includes(quiz.difficulty))
    }

    // Time range filter
    filtered = filtered.filter(quiz => 
      quiz.time_limit >= timeRange[0] && quiz.time_limit <= timeRange[1]
    )

    return filtered
  }, [quizzes, searchTerm, selectedCategories, selectedDifficulties, timeRange])

  const resetAllFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedDifficulties([])
    setTimeRange([1, 120])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Explore <span className="text-purple-600">Quizzes</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover quizzes across various categories and challenge yourself
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <div className="p-6">
                  <Skeleton className="h-6 w-20 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="border border-red-300 bg-red-50 dark:bg-red-900/20 p-6 rounded-md text-red-700 dark:text-red-400 max-w-md mx-auto">
          <h3 className="font-semibold mb-2">Error loading quizzes</h3>
          <p className="mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Explore <span className="text-purple-600">Quizzes</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover quizzes across various categories and challenge yourself
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <QuizFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedDifficulties={selectedDifficulties}
              setSelectedDifficulties={setSelectedDifficulties}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              difficulties={difficulties}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''}
                {(searchTerm || selectedCategories.length > 0 || selectedDifficulties.length > 0 || timeRange[0] !== 1 || timeRange[1] !== 120) && " matching your filters"}
              </p>
            </div>

            {filteredQuizzes.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Target className="h-12 w-12 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try adjusting your search terms or filters to find more quizzes.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={resetAllFilters}
                    >
                      Clear all filters
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <QuizList quizzes={filteredQuizzes} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}