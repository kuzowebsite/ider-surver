"use client"

import { useState } from "react"

// Хук для управления ответами на вопросы
export function useAnswers() {
  const [answers, setAnswers] = useState<Record<number, any>>({})

  const updateAnswer = (questionId: number, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  return { answers, updateAnswer }
}

