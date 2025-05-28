"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { PlusCircle, Trash2, ArrowLeft, ArrowRight, Save, ImageIcon, Clock, HelpCircle } from "lucide-react"

type Question = {
  id: number
  text: string
  options: { id: number; text: string; isCorrect: boolean }[]
  points: number
  timeLimit: number
  imageUrl?: string
  explanation?: string
}

export function CreateQuizForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [timeLimit, setTimeLimit] = useState(15)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "",
      options: [
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
        { id: 3, text: "", isCorrect: false },
        { id: 4, text: "", isCorrect: false },
      ],
      points: 10,
      timeLimit: 30,
      explanation: "",
    },
  ])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      text: "",
      options: [
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
        { id: 3, text: "", isCorrect: false },
        { id: 4, text: "", isCorrect: false },
      ],
      points: 10,
      timeLimit: 30,
      explanation: "",
    }
    setQuestions([...questions, newQuestion])
    setCurrentQuestionIndex(questions.length)
  }

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    setQuestions(newQuestions)
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1)
    }
  }

  const handleQuestionChange = (field: string, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      [field]: value,
    }
    setQuestions(updatedQuestions)
  }

  const handleOptionChange = (optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    const options = [...updatedQuestions[currentQuestionIndex].options]
    options[optionIndex] = { ...options[optionIndex], [field]: value }
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      options,
    }
    setQuestions(updatedQuestions)
  }

  const handleCorrectOptionChange = (optionIndex: number) => {
    const updatedQuestions = [...questions]
    const options = updatedQuestions[currentQuestionIndex].options.map((option, index) => ({
      ...option,
      isCorrect: index === optionIndex,
    }))
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      options,
    }
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/quizzes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          timeLimit,
          isPublic,
          questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quiz');
      }

      // Show success message (you might want to use a toast notification)
      console.log('Quiz created successfully:', data.quiz);
      
      // Redirect to the quizzes page
      router.push("/my-quizzes");
    } catch (error) {
      console.error("Error creating quiz:", error);
      
      // Show error message to user (you might want to use a toast notification)
      alert(error instanceof Error ? error.message : 'Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDetailsValid = title && description && category && difficulty
  const isQuestionsValid = questions.every(
    (q) => q.text && q.options.every((o) => o.text) && q.options.some((o) => o.isCorrect),
  )

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Quiz Details</TabsTrigger>
          <TabsTrigger value="questions" disabled={!isDetailsValid}>
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
                <CardDescription>Provide basic information about your quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your quiz"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your quiz is about"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="art">Art & Literature</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="timeLimit"
                      min={5}
                      max={60}
                      step={5}
                      value={[timeLimit]}
                      onValueChange={(value) => setTimeLimit(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{timeLimit}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="public">Make quiz public</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => setActiveTab("questions")} disabled={!isDetailsValid}>
                  Next: Add Questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="questions">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>Add questions and answers to your quiz</CardDescription>
                  </div>
                  <div className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10 p-0"
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" className="w-10 h-10 p-0" onClick={handleAddQuestion}>
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question-text">Question</Label>
                  <Textarea
                    id="question-text"
                    placeholder="Enter your question"
                    value={currentQuestion.text}
                    onChange={(e) => handleQuestionChange("text", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-points">Points</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="question-points"
                        min={5}
                        max={50}
                        step={5}
                        value={[currentQuestion.points]}
                        onValueChange={(value) => handleQuestionChange("points", value[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{currentQuestion.points}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-time" className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Time Limit (seconds)
                    </Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="question-time"
                        min={10}
                        max={120}
                        step={5}
                        value={[currentQuestion.timeLimit]}
                        onValueChange={(value) => handleQuestionChange("timeLimit", value[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{currentQuestion.timeLimit}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Image (Optional)</Label>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Add Image
                    </Button>
                  </div>
                  {currentQuestion.imageUrl && (
                    <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                      <img
                        src={currentQuestion.imageUrl || "/placeholder.svg"}
                        alt="Question"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() => handleQuestionChange("imageUrl", undefined)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Answer Options</Label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`correct-${index}`}
                          name="correct-option"
                          checked={option.isCorrect}
                          onChange={() => handleCorrectOptionChange(index)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        <Label htmlFor={`correct-${index}`} className="text-sm">
                          Correct
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation" className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Answer Explanation (Optional)
                  </Label>
                  <Textarea
                    id="explanation"
                    placeholder="Provide a brief explanation for the correct answer..."
                    value={currentQuestion.explanation || ""}
                    onChange={(e) => handleQuestionChange("explanation", e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This explanation will be shown to users after they answer the question.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveQuestion(currentQuestionIndex)}
                    disabled={questions.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Question
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Details
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleAddQuestion}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                  <Button onClick={handleSubmit} disabled={!isQuestionsValid || isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Quiz"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}