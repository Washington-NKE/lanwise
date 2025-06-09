import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import EditQuizForm from "@/components/EditQuizForm"
import { Skeleton } from "@/components/ui/skeleton"

export default function QuizPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          }
        >
          <EditQuizForm quizId={params.id} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
