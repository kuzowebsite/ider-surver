// Этот файл создан для исправления ошибки импорта в survey-form.tsx
import { surveyQuestions } from "./survey-questions"

// Экспортируем хук, который возвращает вопросы
export function useQuestions() {
  return { questions: surveyQuestions }
}

