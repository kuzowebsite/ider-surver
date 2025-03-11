"use client"

import { useState } from "react"

// Хук для управления пользовательскими ответами
export function useCustomAnswers() {
  const [customAnswers, setCustomAnswers] = useState<Record<number, string>>({})

  const updateCustomAnswer = (questionId: number, value: string) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  return { customAnswers, updateCustomAnswer }
}

