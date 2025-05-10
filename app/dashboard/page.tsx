import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <DashboardContent />
      </main>
      <Footer />
    </div>
  )
}
