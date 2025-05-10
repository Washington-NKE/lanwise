"use client"

import { Button } from "@/components/ui/button"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Brain, Trophy, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export function LandingHero() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="relative overflow-hidden py-20 sm:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[50%] top-0 h-[500px] w-[500px] -translate-x-[50%] rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-3xl" />
        <div className="absolute right-[25%] top-[25%] h-[300px] w-[300px] rounded-full bg-gradient-to-r from-blue-400/30 to-cyan-400/30 blur-3xl" />
        <div className="absolute left-[25%] bottom-[25%] h-[250px] w-[250px] rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-400/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
            >
              Test Your Knowledge with <span className="gradient-text">Interactive Quizzes</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0"
            >
              Challenge yourself with our vibrant quiz platform. Learn, compete, and track your progress across various
              topics.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {session ? (
                <Button size="lg" onClick={() => router.push("/quizzes")} className="text-lg group">
                  Start Quizzing
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <Button size="lg" onClick={() => signIn()} className="text-lg group">
                  Sign In to Start
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
              <Button variant="outline" size="lg" asChild className="text-lg border-2">
                <Link href="/about">Learn More</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8"
            >
              <div className="flex items-center">
                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">100+</p>
                  <p className="text-gray-500 dark:text-gray-400">Quizzes</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">10k+</p>
                  <p className="text-gray-500 dark:text-gray-400">Users</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                  <Trophy className="h-6 w-6 text-pink-600 dark:text-pink-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">50k+</p>
                  <p className="text-gray-500 dark:text-gray-400">Completed Quizzes</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse-slow" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Science Quiz</h3>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Question 3/10</div>
                  </div>
                  <div className="space-y-6">
                    <div className="text-lg font-medium">What is the chemical symbol for gold?</div>
                    <div className="space-y-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-colors"
                      >
                        A. Go
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 cursor-pointer"
                      >
                        B. Au
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-colors"
                      >
                        C. Ag
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-colors"
                      >
                        D. Gd
                      </motion.div>
                    </div>
                    <div className="pt-4">
                      <Button className="w-full text-lg py-6">Next Question</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
