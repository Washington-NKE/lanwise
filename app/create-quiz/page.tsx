import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CreateQuizForm } from "@/components/create-quiz-form"

export default function CreateQuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Create a <span className="gradient-text">Quiz</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Design your own quiz with custom questions and answers
          </p>
        </div>
        <CreateQuizForm />
      </main>
      <Footer />
    </div>
  )
}
