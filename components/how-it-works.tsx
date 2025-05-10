"use client"

import { motion } from "framer-motion"
import { Brain, Trophy, BarChart3, UserPlus } from "lucide-react"

const steps = [
  {
    icon: <UserPlus className="h-10 w-10 text-purple-600" />,
    title: "Create an Account",
    description: "Sign up for free and create your personal profile to track your progress.",
  },
  {
    icon: <Brain className="h-10 w-10 text-blue-600" />,
    title: "Choose a Quiz",
    description: "Browse through our collection of quizzes across various categories and difficulty levels.",
  },
  {
    icon: <Trophy className="h-10 w-10 text-pink-600" />,
    title: "Complete Challenges",
    description: "Answer questions, earn points, and compete with others on the leaderboard.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-green-600" />,
    title: "Track Progress",
    description: "Monitor your performance, see your strengths and areas for improvement.",
  },
]

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How <span className="gradient-text">It Works</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with QuizMaster in just a few simple steps
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center hover:shadow-xl transition-shadow"
            >
              <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse-slow" />
                <div className="relative">{step.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="relative mt-20">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-purple-50 dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
              Ready to start?
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
