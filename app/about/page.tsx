import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AboutContent } from "@/components/about-content"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main>
        <AboutContent />
      </main>
      <Footer />
    </div>
  )
}
