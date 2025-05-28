// File should be located at: app/api/seed/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hash } from "bcrypt";

// Define which HTTP methods are allowed for this endpoint
export const dynamic = 'force-dynamic'; // Prevents caching issues

// Define allowed methods
export async function POST() {
  try {
    // Create a demo user
    const hashedPassword = await hash("password123", 10);
    await sql`
      INSERT INTO users (name, email, password, image)
      VALUES ('Demo User', 'demo@example.com', ${hashedPassword}, '/placeholder.svg?height=40&width=40')
      ON CONFLICT (email) DO NOTHING
    `;

    // Create some quizzes
    const quizzes = [
      {
        title: "World Geography",
        description: "Test your knowledge of countries, capitals, and landmarks",
        difficulty: "Medium",
        time_limit: 15,
        image_url: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Science Trivia",
        description: "Explore the wonders of physics, chemistry, and biology",
        difficulty: "Hard",
        time_limit: 20,
        image_url: "/placeholder.svg?height=200&width=400",
      },
      {
        title: "Pop Culture",
        description: "How well do you know movies, music, and celebrities?",
        difficulty: "Easy",
        time_limit: 10,
        image_url: "/placeholder.svg?height=200&width=400",
      },
    ];

    for (const quiz of quizzes) {
      const [createdQuiz] = await sql`
        INSERT INTO quizzes (title, description, difficulty, time_limit, image_url, created_by)
        VALUES (
          ${quiz.title}, 
          ${quiz.description}, 
          ${quiz.difficulty}, 
          ${quiz.time_limit}, 
          ${quiz.image_url},
          (SELECT id FROM users WHERE email = 'demo@example.com')
        )
        RETURNING id
      `;

      // Add questions for each quiz
      if (quiz.title === "World Geography") {
        await addGeographyQuestions(createdQuiz.id);
      } else if (quiz.title === "Science Trivia") {
        await addScienceQuestions(createdQuiz.id);
      } else if (quiz.title === "Pop Culture") {
        await addPopCultureQuestions(createdQuiz.id);
      }
    }

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json({ message: "Error seeding database" }, { status: 500 });
  }
}

// For debugging - add a GET method as well
export async function GET() {
  return NextResponse.json({ message: "Seed endpoint active. Use POST to seed the database." });
}

async function addGeographyQuestions(quizId: number) {
  const questions = [
    {
      question: "What is the capital of France?",
      options: [
        { text: "London", isCorrect: false },
        { text: "Berlin", isCorrect: false },
        { text: "Paris", isCorrect: true },
        { text: "Madrid", isCorrect: false },
      ],
      order_num: 1,
    },
    {
      question: "Which is the largest ocean on Earth?",
      options: [
        { text: "Atlantic Ocean", isCorrect: false },
        { text: "Indian Ocean", isCorrect: false },
        { text: "Arctic Ocean", isCorrect: false },
        { text: "Pacific Ocean", isCorrect: true },
      ],
      order_num: 2,
    },
    {
      question: "Which country is known as the Land of the Rising Sun?",
      options: [
        { text: "China", isCorrect: false },
        { text: "Japan", isCorrect: true },
        { text: "Thailand", isCorrect: false },
        { text: "South Korea", isCorrect: false },
      ],
      order_num: 3,
    },
    {
      question: "The Great Barrier Reef is located in which country?",
      options: [
        { text: "Brazil", isCorrect: false },
        { text: "Australia", isCorrect: true },
        { text: "Indonesia", isCorrect: false },
        { text: "Mexico", isCorrect: false },
      ],
      order_num: 4,
    },
    {
      question: "Which desert is the largest in the world?",
      options: [
        { text: "Gobi Desert", isCorrect: false },
        { text: "Kalahari Desert", isCorrect: false },
        { text: "Sahara Desert", isCorrect: false },
        { text: "Antarctic Desert", isCorrect: true },
      ],
      order_num: 5,
    },
  ];

  await addQuestionsAndAnswers(quizId, questions);
}

async function addScienceQuestions(quizId: number) {
  const questions = [
    {
      question: "What is the chemical symbol for gold?",
      options: [
        { text: "Go", isCorrect: false },
        { text: "Au", isCorrect: true },
        { text: "Ag", isCorrect: false },
        { text: "Gd", isCorrect: false },
      ],
      order_num: 1,
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: [
        { text: "Venus", isCorrect: false },
        { text: "Jupiter", isCorrect: false },
        { text: "Mars", isCorrect: true },
        { text: "Saturn", isCorrect: false },
      ],
      order_num: 2,
    },
    {
      question: "What is the hardest natural substance on Earth?",
      options: [
        { text: "Diamond", isCorrect: true },
        { text: "Platinum", isCorrect: false },
        { text: "Quartz", isCorrect: false },
        { text: "Titanium", isCorrect: false },
      ],
      order_num: 3,
    },
    {
      question: "Which of these is NOT a type of blood cell?",
      options: [
        { text: "Red blood cell", isCorrect: false },
        { text: "White blood cell", isCorrect: false },
        { text: "Platelet", isCorrect: false },
        { text: "Neuron", isCorrect: true },
      ],
      order_num: 4,
    },
    {
      question: "What is the speed of light in a vacuum?",
      options: [
        { text: "300,000 km/s", isCorrect: true },
        { text: "150,000 km/s", isCorrect: false },
        { text: "500,000 km/s", isCorrect: false },
        { text: "1,000,000 km/s", isCorrect: false },
      ],
      order_num: 5,
    },
  ];

  await addQuestionsAndAnswers(quizId, questions);
}

async function addPopCultureQuestions(quizId: number) {
  const questions = [
    {
      question: "Who played Iron Man in the Marvel Cinematic Universe?",
      options: [
        { text: "Chris Evans", isCorrect: false },
        { text: "Chris Hemsworth", isCorrect: false },
        { text: "Robert Downey Jr.", isCorrect: true },
        { text: "Mark Ruffalo", isCorrect: false },
      ],
      order_num: 1,
    },
    {
      question: "Which band performed the song 'Bohemian Rhapsody'?",
      options: [
        { text: "The Beatles", isCorrect: false },
        { text: "Queen", isCorrect: true },
        { text: "Led Zeppelin", isCorrect: false },
        { text: "The Rolling Stones", isCorrect: false },
      ],
      order_num: 2,
    },
    {
      question: "What is the name of Harry Potter's owl?",
      options: [
        { text: "Hedwig", isCorrect: true },
        { text: "Errol", isCorrect: false },
        { text: "Crookshanks", isCorrect: false },
        { text: "Scabbers", isCorrect: false },
      ],
      order_num: 3,
    },
    {
      question: "Which TV show features characters named Ross, Rachel, Monica, Chandler, Joey, and Phoebe?",
      options: [
        { text: "How I Met Your Mother", isCorrect: false },
        { text: "The Big Bang Theory", isCorrect: false },
        { text: "Friends", isCorrect: true },
        { text: "Seinfeld", isCorrect: false },
      ],
      order_num: 4,
    },
    {
      question: "Who is the author of the 'Harry Potter' book series?",
      options: [
        { text: "J.R.R. Tolkien", isCorrect: false },
        { text: "J.K. Rowling", isCorrect: true },
        { text: "George R.R. Martin", isCorrect: false },
        { text: "Stephen King", isCorrect: false },
      ],
      order_num: 5,
    },
  ];

  await addQuestionsAndAnswers(quizId, questions);
}

async function addQuestionsAndAnswers(quizId: number, questions: any[]) {
  for (const q of questions) {
    const [question] = await sql`
      INSERT INTO questions (quiz_id, question, order_num, points, time_limit)
      VALUES (${quizId}, ${q.question}, ${q.order_num}, 10, 30)
      RETURNING id
    `;

    for (const option of q.options) {
      await sql`
        INSERT INTO answers (question_id, answer_text, is_correct)
        VALUES (${question.id}, ${option.text}, ${option.isCorrect})
      `;
    }
  }
}