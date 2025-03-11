"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { ref, push, get } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Question } from "@/lib/survey-questions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Info,
  HelpCircle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

interface SurveyFormProps {
  questions: Question[]
}

// Кибер фон
const CyberBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Хар фон */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Неон шугамууд */}
      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-[1px] w-full"
            style={{
              top: `${20 + i * 15}%`,
              background: `linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, ${0.1 + i * 0.02}) 50%, transparent 100%)`,
              opacity: 0.3 + (i % 3) * 0.2,
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 20 - i,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Цэгэн торлог */}
      <div className="absolute inset-0 bg-[url('/dots.svg')] bg-repeat opacity-10" />

      {/* Скан шугам */}
      <div className="scan-line" />

      {/* Хөвөгч тойргууд */}
      {Array.from({ length: 8 }).map((_, i) => {
        const size = 50 + Math.random() * 150
        return (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0) 70%)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [Math.random() * 30, Math.random() * -30, Math.random() * 30],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 10 + Math.random() * 10,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}

// Неон явцын заалт
const NeonProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="h-2 w-full bg-slate-800/50 rounded-sm overflow-hidden backdrop-blur-sm">
      <motion.div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, rgba(56, 189, 248, 0.7), rgba(59, 130, 246, 0.7))",
          boxShadow: "0 0 10px rgba(56, 189, 248, 0.7), 0 0 20px rgba(56, 189, 248, 0.3)",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Гялалзах эффект */}
        <motion.div
          className="absolute top-0 right-0 h-full w-5 bg-white/30 blur-sm"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            ease: "linear",
          }}
        />
      </motion.div>
    </div>
  )
}

// Неон товч
const NeonButton = ({
  onClick,
  children,
  disabled = false,
  variant = "default",
  className = "",
  icon,
}: {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  variant?: "default" | "outline"
  className?: string
  icon?: React.ReactNode
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Interactive motion values
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-10, 10], [2, -2])
  const rotateY = useTransform(x, [-10, 10], [-2, 2])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) / 5)
    y.set((e.clientY - centerY) / 5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
    setIsPressed(false)
  }

  return (
    <motion.div
      className="relative perspective-500"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="ghost"
        className={cn(
          "relative z-10 px-6 py-2 rounded-md overflow-hidden transition-all duration-300",
          variant === "default" ? "border border-cyan-500/50 text-white" : "border border-slate-700 text-slate-300",
          disabled && "opacity-50 cursor-not-allowed",
          isPressed && !disabled && "translate-y-[1px]",
          className,
        )}
      >
        <span className="relative z-10 flex items-center gap-2">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
          {isHovered && variant === "default" && !disabled && (
            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-4 w-4" />
            </motion.span>
          )}
        </span>

        {/* Неон эффект */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              variant === "default"
                ? "linear-gradient(90deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.2))"
                : "rgba(15, 23, 42, 0.3)",
          }}
          animate={isHovered && !disabled ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Интерактив эффект */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={isHovered && !disabled ? { x: "100%" } : { x: "-100%" }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: isHovered ? Number.POSITIVE_INFINITY : 0 }}
        />
      </Button>

      {/* Неон гэрэл */}
      <AnimatePresence>
        {isHovered && variant === "default" && !disabled && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-md"
            style={{
              boxShadow: "0 0 10px rgba(56, 189, 248, 0.5), 0 0 20px rgba(56, 189, 248, 0.3)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Интерактив тусламж товч
const HelpButton = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        className="text-cyan-400 hover:text-cyan-300 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-5 w-5" />
        <span className="sr-only">Тусламж</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-50 w-64 p-3 rounded-md bg-slate-800/90 backdrop-blur-sm border border-cyan-500/30 text-sm text-slate-200 shadow-lg"
            style={{
              top: "calc(100% + 8px)",
              right: 0,
              boxShadow: "0 0 15px rgba(56, 189, 248, 0.2)",
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>{content}</p>
            </div>
            <div className="absolute w-3 h-3 bg-slate-800 border-t border-l border-cyan-500/30 transform rotate-45 -top-1.5 right-5"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Интерактив радио товч
const CyberRadioOption = ({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: { id: number; text: string }
  isSelected: boolean
  onSelect: () => void
  index: number
}) => {
  return (
    <motion.div
      className={cn(
        "relative border rounded-md overflow-hidden transition-all duration-300",
        isSelected
          ? "border-cyan-500/50 bg-cyan-500/10"
          : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80",
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      <button
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-md"
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              isSelected ? "border-cyan-400" : "border-slate-600",
            )}
          >
            {isSelected && (
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-cyan-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </div>
          <span className="text-base text-slate-200">{option.text}</span>
        </div>
      </button>

      {isSelected && (
        <>
          <motion.div
            className="absolute inset-0 rounded-md border border-cyan-500/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            layoutId="selected-option"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            style={{ boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)" }}
          />

          {/* Неон эффект сонгогдсон үед */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, rgba(56, 189, 248, 0.5), rgba(59, 130, 246, 0.5))",
            }}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />

          {/* Гялалзах эффект */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          />
        </>
      )}
    </motion.div>
  )
}

// Интерактив чекбокс товч
const CyberCheckboxOption = ({
  option,
  isChecked,
  onToggle,
  index,
}: {
  option: { id: number; text: string }
  isChecked: boolean
  onToggle: (checked: boolean) => void
  index: number
}) => {
  return (
    <motion.div
      className={cn(
        "relative border rounded-md overflow-hidden transition-all duration-300",
        isChecked
          ? "border-cyan-500/50 bg-cyan-500/10"
          : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80",
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      <button
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-md"
        onClick={() => onToggle(!isChecked)}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all duration-300",
              isChecked ? "border-cyan-400 bg-cyan-500/30" : "border-slate-600",
            )}
          >
            {isChecked && (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </motion.svg>
            )}
          </div>
          <span className="text-base text-slate-200">{option.text}</span>
        </div>
      </button>

      {isChecked && (
        <>
          <motion.div
            className="absolute inset-0 rounded-md border border-cyan-500/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            style={{ boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)" }}
          />

          {/* Неон эффект сонгогдсон үед */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, rgba(56, 189, 248, 0.5), rgba(59, 130, 246, 0.5))",
            }}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />

          {/* Гялалзах эффект */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          />
        </>
      )}
    </motion.div>
  )
}

// Асуултын дугаар
const QuestionNumber = ({ number, total }: { number: number; total: number }) => {
  return (
    <div className="inline-flex items-center justify-center">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="text-lg font-bold text-cyan-400">
          {number}
          <span className="text-slate-400 text-sm font-normal">/{total}</span>
        </div>
        <div className="absolute -inset-1 rounded-full border border-cyan-500/30" />
        <div className="absolute -inset-2 rounded-full border border-cyan-500/20" />
        <motion.div
          className="absolute -inset-3 rounded-full border border-cyan-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
        />
      </motion.div>
    </div>
  )
}

export default function SurveyForm({ questions: initialQuestions }: SurveyFormProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [customAnswers, setCustomAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)

  // Fetch questions from Firebase if available
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = ref(database, "questions")
        const snapshot = await get(questionsRef)

        if (snapshot.exists()) {
          const questionsData = snapshot.val()
          setQuestions(questionsData)
        } else {
          // If no questions in Firebase, use the initial questions
          setQuestions(initialQuestions)
        }
      } catch (error) {
        console.error("Error fetching questions:", error)
        // Fallback to initial questions if there's an error
        setQuestions(initialQuestions)
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    fetchQuestions()
  }, [initialQuestions])

  // Мобайл эсэхийг шалгах
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleSingleOptionChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleMultipleOptionChange = (optionId: number, checked: boolean) => {
    const currentAnswers = answers[currentQuestion.id] || []
    let newAnswers

    if (checked) {
      newAnswers = [...currentAnswers, optionId]
    } else {
      newAnswers = currentAnswers.filter((id: number) => id !== optionId)
    }

    setAnswers({ ...answers, [currentQuestion.id]: newAnswers })
  }

  const handleCustomAnswerChange = (value: string) => {
    setCustomAnswers({ ...customAnswers, [currentQuestion.id]: value })
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const isCurrentQuestionAnswered = () => {
    if (currentQuestion.type === "single") {
      return !!answers[currentQuestion.id]
    } else if (currentQuestion.type === "multiple") {
      const selectedOptions = answers[currentQuestion.id] || []
      return selectedOptions.length > 0
    }
    return false
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Мэдээллийг бэлтгэх
      const formattedAnswers = Object.keys(answers).reduce((acc, questionId) => {
        const qId = Number.parseInt(questionId)
        const question = questions.find((q) => q.id === qId)

        if (!question) return acc

        let answerValue = answers[qId]

        // Нэг сонголттой хариултыг форматлах
        if (question.type === "single") {
          const optionId = Number.parseInt(answerValue)
          const option = question.options.find((o) => o.id === optionId)

          answerValue = {
            optionId,
            text: option?.text || "",
            customText: optionId === question.options.length && question.allowCustom ? customAnswers[qId] || "" : "",
          }
        }
        // Олон сонголттой хариултыг форматлах
        else if (question.type === "multiple") {
          answerValue = answerValue.map((optId: number) => {
            const option = question.options.find((o) => o.id === optId)
            return {
              optionId: optId,
              text: option?.text || "",
              customText: optId === question.options.length && question.allowCustom ? customAnswers[qId] || "" : "",
            }
          })
        }

        return {
          ...acc,
          [questionId]: {
            questionText: question.text,
            answer: answerValue,
          },
        }
      }, {})

      // Илгээх өгөгдлийг үүсгэх
      const surveyData = {
        answers: formattedAnswers,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        device: {
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 768,
        },
      }

      console.log("Firebase-рүү өгөгдөл илгээж байна:", surveyData)

      try {
        // Firebase-рүү илгээх
        const surveyRef = ref(database, "surveys")
        await push(surveyRef, surveyData)

        setSubmitted(true)
        toast({
          title: "Судалгаа амжилттай илгээгдлээ",
          description: "Таны хариултыг хүлээн авлаа. Баярлалаа!",
          duration: 5000,
        })
      } catch (firebaseError: any) {
        console.error("Firebase алдаа:", firebaseError)

        // Firebase-рүү илгээх боломжгүй бол локал хадгалах
        const localSurveys = JSON.parse(localStorage.getItem("surveys") || "[]")
        localSurveys.push(surveyData)
        localStorage.setItem("surveys", JSON.stringify(localSurveys))

        toast({
          title: "Өгөгдөл локал хадгалагдлаа",
          description: "Firebase-рүү илгээх боломжгүй байсан тул өгөгдлийг локал хадгаллаа.",
          duration: 5000,
        })

        setSubmitted(true)
      }
    } catch (error) {
      console.error("Судалгаа илгээхэд алдаа гарлаа:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Судалгааг илгээх үед алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetSurvey = () => {
    setAnswers({})
    setCustomAnswers({})
    setCurrentQuestionIndex(0)
    setSubmitted(false)
  }

  // Add a loading state for questions
  if (isLoadingQuestions) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <CyberBackground />
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-300">Судалгааны асуултуудыг ачаалж байна...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <CyberBackground />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            className="relative w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
            }}
            animate={{
              boxShadow: [
                "0 0 10px rgba(16, 185, 129, 0.3)",
                "0 0 30px rgba(16, 185, 129, 0.6)",
                "0 0 10px rgba(16, 185, 129, 0.3)",
              ],
            }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, 0] }}
              transition={{
                scale: { duration: 0.5, type: "spring", bounce: 0.5 },
                rotate: { duration: 1.5, ease: "easeInOut", times: [0, 0.6, 1], delay: 0.5 },
              }}
            >
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </motion.div>

            {/* Неон орбитууд */}
            <motion.div
              className="absolute inset-[-8px] rounded-full border border-green-500/20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 10, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[-16px] rounded-full border border-green-500/10"
              animate={{ rotate: -360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 15, ease: "linear" }}
            />

            {/* Гялалзах эффект */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0) 70%)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.h2
            className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400"
            style={{
              textShadow: "0 0 10px rgba(16, 185, 129, 0.7), 0 0 20px rgba(16, 185, 129, 0.5)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Таны хувь нэмэрт баярлалаа!
          </motion.h2>

          <motion.p
            className="text-lg text-slate-300 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Таны өгсөн <span className="text-cyan-400 font-medium">үнэтэй санал</span> бидний цахим орчныг сайжруулах,
            оюутнуудын хэрэгцээнд нийцсэн <span className="text-cyan-400 font-medium">шинэ боломжуудыг</span> бий
            болгоход чухал хувь нэмэр оруулах болно.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center"
          >
            <NeonButton onClick={resetSurvey} icon={<Sparkles className="h-4 w-4" />}>
              Дахин судалгаа өгөх
            </NeonButton>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-12 relative text-white" ref={formRef}>
      <CyberBackground />

      <div className="w-full max-w-3xl relative z-10">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <QuestionNumber number={currentQuestionIndex + 1} total={questions.length} />
              <span className="text-sm text-slate-400">Асуулт</span>
            </div>
            <span className="font-medium text-cyan-400">{Math.round(progress)}%</span>
          </div>
          <NeonProgressBar progress={progress} />
        </div>

        <Card className="border border-cyan-500/20 shadow-lg backdrop-blur-sm bg-slate-900/80 overflow-hidden">
          {/* Неон хил */}
          <motion.div
            className="absolute top-0 left-0 w-full h-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
              ease: "linear",
            }}
          />

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start gap-2">
                  <motion.h2
                    className="text-xl md:text-2xl font-semibold text-white"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentQuestion.text}
                  </motion.h2>

                  <HelpButton
                    content={
                      currentQuestion.type === "single"
                        ? "Нэг хариултыг сонгоно уу"
                        : "Нэг буюу хэд хэдэн хариултыг сонгоно уу"
                    }
                  />
                </div>

                {currentQuestion.type === "single" && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion.id]?.toString() === option.id.toString()

                      return (
                        <CyberRadioOption
                          key={option.id}
                          option={option}
                          isSelected={isSelected}
                          onSelect={() => handleSingleOptionChange(option.id.toString())}
                          index={index}
                        />
                      )
                    })}
                  </div>
                )}

                {currentQuestion.type === "multiple" && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const currentAnswerArray = answers[currentQuestion.id] || []
                      const isChecked = currentAnswerArray.includes(option.id)

                      return (
                        <CyberCheckboxOption
                          key={option.id}
                          option={option}
                          isChecked={isChecked}
                          onToggle={(checked) => handleMultipleOptionChange(option.id, checked)}
                          index={index}
                        />
                      )
                    })}
                  </div>
                )}

                {currentQuestion.allowCustom &&
                  ((currentQuestion.type === "single" &&
                    answers[currentQuestion.id] === currentQuestion.options.length.toString()) ||
                    (currentQuestion.type === "multiple" &&
                      (answers[currentQuestion.id] || []).includes(currentQuestion.options.length))) && (
                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label
                        htmlFor={`custom-answer-${currentQuestion.id}`}
                        className="text-cyan-400 font-medium mb-2 block"
                      >
                        Тодорхойлно уу:
                      </Label>
                      <Textarea
                        id={`custom-answer-${currentQuestion.id}`}
                        value={customAnswers[currentQuestion.id] || ""}
                        onChange={(e) => handleCustomAnswerChange(e.target.value)}
                        className="mt-1 border-cyan-500/20 focus:border-cyan-500/50 bg-slate-800/50 text-white resize-none"
                        placeholder="Таны хариултыг энд бичнэ үү..."
                      />
                    </motion.div>
                  )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <NeonButton
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Өмнөх
          </NeonButton>

          {currentQuestionIndex < questions.length - 1 ? (
            <NeonButton
              onClick={goToNextQuestion}
              disabled={!isCurrentQuestionAnswered()}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Дараах
            </NeonButton>
          ) : (
            <NeonButton
              onClick={handleSubmit}
              disabled={!isCurrentQuestionAnswered() || isSubmitting}
              icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            >
              {isSubmitting ? "Илгээж байна..." : "Илгээх"}
            </NeonButton>
          )}
        </div>

        {!isCurrentQuestionAnswered() && currentQuestionIndex === questions.length - 1 && (
          <motion.div
            className="mt-4 flex items-center gap-2 text-amber-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Илгээхийн өмнө бүх асуултад хариулна уу</span>
          </motion.div>
        )}
      </div>
      <Toaster />
    </div>
  )
}

