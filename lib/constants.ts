import { Brain, Trophy, Users, Zap, Globe, Heart,Award, BarChart2, Clock, TrendingUp, BookOpen, Target } from "lucide-react"
import { ReactElement } from "react"

interface ValueItem {
  icon: ReactElement;
  title: string;
  description: string;
}

export const teamMembers = [
  {
    name: "Washington Mwangi",
    role: "Founder & CEO",
    bio: "Quiz enthusiast with a passion for education and technology.",
    avatar: "/placeholder.svg?height=100&width=100",
  },
//   {
//     name: "Sarah Williams",
//     role: "Content Director",
//     bio: "Former teacher with expertise in curriculum development.",
//     avatar: "/placeholder.svg?height=100&width=100",
//   },
//   {
//     name: "Michael Chen",
//     role: "Lead Developer",
//     bio: "Full-stack developer with a love for creating interactive experiences.",
//     avatar: "/placeholder.svg?height=100&width=100",
//   },
//   {
//     name: "Emily Davis",
//     role: "UX Designer",
//     bio: "Designer focused on creating intuitive and engaging user interfaces.",
//     avatar: "/placeholder.svg?height=100&width=100",
//   },
];

export const categories = [
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "geography", label: "Geography" },
  { id: "entertainment", label: "Entertainment" },
  { id: "sports", label: "Sports" },
  { id: "technology", label: "Technology" },
  { id: "art", label: "Art & Literature" },
  { id: "music", label: "Music" },
]

export const difficulties = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
]

export const recentQuizzes = [
  {
    id: 1,
    title: "World Geography",
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    date: "2023-05-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Science Trivia",
    score: 60,
    totalQuestions: 10,
    correctAnswers: 6,
    date: "2023-05-10T14:20:00Z",
  },
  {
    id: 3,
    title: "History Buff",
    score: 90,
    totalQuestions: 10,
    correctAnswers: 9,
    date: "2023-05-05T09:15:00Z",
  },
]

export const achievements = [
  {
    id: 1,
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    progress: 30,
    icon: Trophy,
    className: "h-8 w-8 text-yellow-500",
  },
  {
    id: 2,
    title: "Perfect Score",
    description: "Get 100% on any quiz",
    progress: 0,
    icon: Award,
    className:"h-8 w-8 text-purple-500"
  },
  {
    id: 3,
    title: "Speed Demon",
    description: "Complete a quiz in under 2 minutes",
    progress: 100,
    icon: Clock,
    className:"h-8 w-8 text-blue-500",
    completed: true,
  },
  {
    id: 4,
    title: "Knowledge Seeker",
    description: "Try quizzes from 5 different categories",
    progress: 60,
    icon: BookOpen,
    className:"h-8 w-8 text-green-500",
  },
]

export const recommendedQuizzes = [
  {
    id: 1,
    title: "Pop Culture",
    description: "Test your knowledge of movies, music, and celebrities",
    difficulty: "Easy",
    category: "Entertainment",
  },
  {
    id: 2,
    title: "Tech Wizards",
    description: "All about computers, gadgets, and innovation",
    difficulty: "Hard",
    category: "Technology",
  },
  {
    id: 3,
    title: "Sports Champions",
    description: "From football to cricket, test your sports knowledge",
    difficulty: "Medium",
    category: "Sports",
  },
]