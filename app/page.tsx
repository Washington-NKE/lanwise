import { LandingHero } from "@/components/landing-hero"
import { FeaturedQuizzes } from "@/components/featured-quizzes"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main>
        <LandingHero />
        <FeaturedQuizzes />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
