import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LeaderboardContent } from "@/components/leaderboard-content"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See how you rank against other quiz enthusiasts
          </p>
        </div>
        <LeaderboardContent />
      </main>
      <Footer />
    </div>
  )
}
