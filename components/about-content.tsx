"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Trophy, Users, Zap, Globe, Heart } from "lucide-react"
import Link from "next/link"

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    bio: "Quiz enthusiast with a passion for education and technology.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Sarah Williams",
    role: "Content Director",
    bio: "Former teacher with expertise in curriculum development.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Michael Chen",
    role: "Lead Developer",
    bio: "Full-stack developer with a love for creating interactive experiences.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Emily Davis",
    role: "UX Designer",
    bio: "Designer focused on creating intuitive and engaging user interfaces.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
]

export function AboutContent() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[50%] top-0 h-[500px] w-[500px] -translate-x-[50%] rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
              About <span className="gradient-text">QuizMaster</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
              We're on a mission to make learning fun, interactive, and accessible to everyone through engaging quizzes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/quizzes">Explore Quizzes</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  QuizMaster was founded in 2023 with a simple idea: learning should be fun, engaging, and accessible to
                  everyone. What started as a small project has grown into a platform used by thousands of people around
                  the world.
                </p>
                <p>
                  Our team of educators, developers, and quiz enthusiasts work together to create high-quality,
                  interactive quizzes across various subjects. We believe that knowledge is power, and our mission is to
                  empower people through learning.
                </p>
                <p>
                  Whether you're a student looking to test your knowledge, a teacher seeking engaging educational tools,
                  or simply someone who enjoys a good challenge, QuizMaster has something for you.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse-slow" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Team working together"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-purple-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Brain className="h-8 w-8 text-purple-600" />,
                title: "Learning",
                description: "We believe in lifelong learning and the power of knowledge.",
              },
              {
                icon: <Zap className="h-8 w-8 text-blue-600" />,
                title: "Innovation",
                description: "We constantly strive to improve and innovate our platform.",
              },
              {
                icon: <Globe className="h-8 w-8 text-green-600" />,
                title: "Accessibility",
                description: "We make education accessible to everyone, everywhere.",
              },
              {
                icon: <Heart className="h-8 w-8 text-red-600" />,
                title: "Passion",
                description: "We're passionate about creating engaging learning experiences.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-purple-600" />,
                value: "10k+",
                label: "Active Users",
              },
              {
                icon: <Brain className="h-10 w-10 text-blue-600" />,
                value: "100+",
                label: "Quizzes Available",
              },
              {
                icon: <Trophy className="h-10 w-10 text-yellow-600" />,
                value: "50k+",
                label: "Quizzes Completed",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-purple-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The passionate people behind QuizMaster
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <div className="text-purple-600 dark:text-purple-400 mb-3">{member.role}</div>
                    <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Test Your Knowledge?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
              Join thousands of users and start your quiz journey today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/quizzes">Start Quizzing</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/signin">Sign Up Free</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
