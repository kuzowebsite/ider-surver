"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ref, onValue, query, orderByChild } from "firebase/database"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { database, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, LogOut, BarChart, FileText, Download, Menu, Settings } from "lucide-react"
import { surveyQuestions } from "@/lib/survey-questions"
import AdminSurveyResults from "@/components/admin-survey-results"
import AdminSurveyCharts from "@/components/admin-survey-charts"
import AdminQuestionManager from "@/components/admin-question-manager"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"

export default function AdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [surveys, setSurveys] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("results")
  const router = useRouter()

  useEffect(() => {
    // Check screen size for mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        fetchSurveys()
      } else {
        setIsLoadingData(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchSurveys = () => {
    setIsLoadingData(true)
    const surveysRef = query(ref(database, "surveys"), orderByChild("timestamp"))

    onValue(
      surveysRef,
      (snapshot) => {
        const data = snapshot.val()
        const surveyList = data
          ? Object.entries(data)
              .map(([id, survey]) => ({
                id,
                ...(survey as any),
              }))
              .reverse()
          : []

        setSurveys(surveyList)
        setIsLoadingData(false)
      },
      (error) => {
        console.error("Error fetching surveys:", error)
        setIsLoadingData(false)
      },
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setError("Нэвтрэх нэр эсвэл нууц үг буруу байна.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/admin")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const exportToCSV = () => {
    if (!surveys.length) return

    // Prepare CSV headers
    let csvContent = "ID,Timestamp,"

    // Add question headers
    surveyQuestions.forEach((question) => {
      csvContent += `"${question.text}",`
    })

    csvContent += "\n"

    // Add data rows
    surveys.forEach((survey) => {
      const timestamp = survey.timestamp ? new Date(survey.timestamp).toLocaleString() : "N/A"
      csvContent += `${survey.id},${timestamp},`

      // Add answers for each question
      surveyQuestions.forEach((question) => {
        const questionId = question.id.toString()
        const answerData = survey.answers && survey.answers[questionId]

        if (!answerData) {
          csvContent += "No answer,"
          return
        }

        if (question.type === "single") {
          const answer = answerData.answer
          let answerText = answer.text

          if (answer.customText) {
            answerText += ` - ${answer.customText}`
          }

          csvContent += `"${answerText}",`
        } else {
          // Multiple choice
          const answers = answerData.answer
          const answerTexts = answers.map((a: any) => {
            let text = a.text
            if (a.customText) {
              text += ` - ${a.customText}`
            }
            return text
          })

          csvContent += `"${answerTexts.join("; ")}",`
        }
      })

      csvContent += "\n"
    })

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `survey_results_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Админ нэвтрэх</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Имэйл хаяг"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Нууц үг"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Нэвтэрч байна...
                  </>
                ) : (
                  "Нэвтрэх"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with mobile menu */}
      {isMobile ? (
        <header className="border-b bg-slate-900 sticky top-0 z-10">
          <div className="w-full px-4 py-3 flex justify-between items-center">
            <h1 className="text-lg font-medium text-slate-100">Админ панел</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-100">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-slate-900 border-slate-800 p-0">
                <div className="flex flex-col h-full p-4">
                  <div className="flex-1 py-6">
                    <nav className="space-y-2">
                      <SheetClose asChild>
                        <Button
                          onClick={() => setActiveTab("results")}
                          className={`w-full flex items-center justify-start gap-2 ${
                            activeTab === "results" ? "bg-cyan-500/20" : ""
                          }`}
                          variant="ghost"
                        >
                          <FileText className="h-4 w-4" />
                          Хариултууд
                        </Button>
                      </SheetClose>

                      <SheetClose asChild>
                        <Button
                          onClick={() => setActiveTab("charts")}
                          className={`w-full flex items-center justify-start gap-2 ${
                            activeTab === "charts" ? "bg-cyan-500/20" : ""
                          }`}
                          variant="ghost"
                        >
                          <BarChart className="h-4 w-4" />
                          Статистик
                        </Button>
                      </SheetClose>

                      <SheetClose asChild>
                        <Button
                          onClick={() => setActiveTab("questions")}
                          className={`w-full flex items-center justify-start gap-2 ${
                            activeTab === "questions" ? "bg-cyan-500/20" : ""
                          }`}
                          variant="ghost"
                        >
                          <Settings className="h-4 w-4" />
                          Асуултууд
                        </Button>
                      </SheetClose>

                      <SheetClose asChild>
                        <Button
                          onClick={exportToCSV}
                          className="w-full flex items-center justify-start gap-2"
                          variant="ghost"
                          disabled={!surveys.length}
                        >
                          <Download className="h-4 w-4" />
                          CSV татах
                        </Button>
                      </SheetClose>

                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full flex items-center justify-start gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Гарах
                      </Button>
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      ) : (
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Судалгааны удирдлагын хэсэг</h1>
            <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Гарах
            </Button>
          </div>
        </header>
      )}

      <main className="flex-1 container mx-auto px-4 py-6">
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Desktop header with export button */}
            {!isMobile && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Нийт судалгаа: {surveys.length}</h2>
                <div className="flex gap-2">
                  <Button onClick={exportToCSV} className="flex items-center gap-2" disabled={!surveys.length}>
                    <Download className="h-4 w-4" />
                    CSV татах
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile tab indicator */}
            {isMobile && (
              <div className="flex overflow-x-auto py-2 mb-4 -mx-4 px-4 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("results")}
                  className={`flex items-center gap-1 ${activeTab === "results" ? "bg-cyan-500/20 border-b-2 border-cyan-500" : ""}`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Хариултууд</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("charts")}
                  className={`flex items-center gap-1 ${activeTab === "charts" ? "bg-cyan-500/20 border-b-2 border-cyan-500" : ""}`}
                >
                  <BarChart className="h-4 w-4" />
                  <span>Статистик</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("questions")}
                  className={`flex items-center gap-1 ${activeTab === "questions" ? "bg-cyan-500/20 border-b-2 border-cyan-500" : ""}`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Асуултууд</span>
                </Button>
              </div>
            )}

            {/* Desktop tabs */}
            {!isMobile && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="results" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Хариултууд
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Статистик
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Асуултууд
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Tab content */}
            {activeTab === "results" && (
              <AdminSurveyResults surveys={surveys} questions={surveyQuestions} isMobile={isMobile} />
            )}

            {activeTab === "charts" && (
              <AdminSurveyCharts surveys={surveys} questions={surveyQuestions} isMobile={isMobile} />
            )}

            {activeTab === "questions" && <AdminQuestionManager />}
          </>
        )}
      </main>
    </div>
  )
}

