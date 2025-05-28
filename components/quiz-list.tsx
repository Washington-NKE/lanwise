import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Award } from "lucide-react"
import { useRouter } from "next/navigation"

// Define the Quiz type
export type Quiz = {
  id: number
  title: string
  description: string
  difficulty: string
  time_limit: number
  image_url: string
  created_by: number
  created_at: string
  creator_name: string
}

interface QuizCardProps {
  quiz: Quiz
  index: number
}

function QuizCard({ quiz, index }: QuizCardProps) {
  const router = useRouter()
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "hard":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  const handleStartQuiz = () => {
    router.push(`/quizzes/${quiz.id}`)
  }

  return (
    <div
      style={{
        opacity: 0,
        transform: 'translateY(20px)',
        animation: `fadeInUp 0.4s ease-out ${index * 0.1}s forwards`
      }}
    >
      <Card className="quiz-card h-full overflow-hidden border-2 hover:border-purple-400 dark:hover:border-purple-500 transition-all">
        <div className="relative h-48 overflow-hidden">
          <img
            src={quiz.image_url || "/api/placeholder/400/200"}
            alt={quiz.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/api/placeholder/400/200"
            }}
          />
          <div className="absolute top-4 right-4">
            <Badge
              className={`${getDifficultyColor(quiz.difficulty)} text-white font-medium`}
            >
              {quiz.difficulty}
            </Badge>
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80">
              Quiz
            </Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{quiz.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{quiz.time_limit} min</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{quiz.creator_name}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1" />
              <span>50 pts</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleStartQuiz}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

interface QuizListProps {
  quizzes: Quiz[]
}

export default function QuizList({ quizzes }: QuizListProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {quizzes.map((quiz, index) => (
          <QuizCard key={quiz.id} quiz={quiz} index={index} />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}