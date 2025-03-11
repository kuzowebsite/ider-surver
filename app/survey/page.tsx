"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { surveyQuestions } from "@/lib/survey-questions"
import SurveyForm from "@/components/survey-form"
import { Loader2 } from "lucide-react"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"

export default function SurveyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState(surveyQuestions)
  const router = useRouter()

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Try to fetch questions from Firebase
        const questionsRef = ref(database, "questions")
        const snapshot = await get(questionsRef)

        if (snapshot.exists()) {
          setQuestions(snapshot.val())
        }
        // If no questions in Firebase, use the default ones from surveyQuestions
      } catch (error) {
        console.error("Error fetching questions:", error)
        // Keep using the default questions if there's an error
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-300">Судалгааг ачаалж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <SurveyForm questions={questions} />
    </div>
  )
}

