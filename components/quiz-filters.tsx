import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Dynamic categories and difficulties based on actual data
const categories = [
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "math", label: "Mathematics" },
  { id: "literature", label: "Literature" },
  { id: "geography", label: "Geography" },
  { id: "sports", label: "Sports" },
  { id: "technology", label: "Technology" },
  { id: "art", label: "Art & Culture" },
  { id: "general", label: "General Knowledge" }
]

interface QuizFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  selectedDifficulties: string[]
  setSelectedDifficulties: (difficulties: string[]) => void
  timeRange: [number, number]
  setTimeRange: (range: [number, number]) => void
  difficulties: string[]
}

export default function QuizFilters({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategories, 
  setSelectedCategories,
  selectedDifficulties, 
  setSelectedDifficulties,
  timeRange, 
  setTimeRange,
  difficulties 
}: QuizFiltersProps) {
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.includes(categoryId) 
        ? selectedCategories.filter((id) => id !== categoryId) 
        : [...selectedCategories, categoryId]
    )
  }

  const handleDifficultyChange = (difficultyId: string) => {
    setSelectedDifficulties(
      selectedDifficulties.includes(difficultyId) 
        ? selectedDifficulties.filter((id) => id !== difficultyId) 
        : [...selectedDifficulties, difficultyId]
    )
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedDifficulties([])
    setTimeRange([1, 120])
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategories.length > 0 ||
    selectedDifficulties.length > 0 ||
    timeRange[0] !== 1 ||
    timeRange[1] !== 120

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search quizzes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["categories", "difficulties", "time"]}>
          <AccordionItem value="categories">
            <AccordionTrigger>Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryChange(category.id)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="difficulties">
            <AccordionTrigger>Difficulty</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {difficulties.map((difficulty) => (
                  <div key={difficulty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${difficulty}`}
                      checked={selectedDifficulties.includes(difficulty)}
                      onCheckedChange={() => handleDifficultyChange(difficulty)}
                    />
                    <Label htmlFor={`difficulty-${difficulty}`} className="text-sm font-normal cursor-pointer">
                      {difficulty}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="time">
            <AccordionTrigger>Time Limit</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Slider 
                  value={timeRange} 
                  min={1} 
                  max={120} 
                  step={1} 
                  onValueChange={setTimeRange}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span>{timeRange[0]} min</span>
                  <span>{timeRange[1]} min</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  )
}