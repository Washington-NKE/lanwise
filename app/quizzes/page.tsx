import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { QuizList } from "@/components/quiz-list"
import { QuizFilters } from "@/components/quiz-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default function QuizzesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Explore <span className="gradient-text">Quizzes</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover quizzes across various categories and challenge yourself
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <QuizFilters />
          </div>
          <div className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              }
            >
              <QuizList />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
