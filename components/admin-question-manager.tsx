"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ref, get, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  MoveUp,
  MoveDown,
  Copy,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  FileQuestion,
  ListChecks,
} from "lucide-react"
import type { Question, Option } from "@/lib/survey-questions"
import { Badge } from "@/components/ui/badge"

export default function AdminQuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("list")
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: "",
    type: "single",
    options: [{ id: 1, text: "" }],
    allowCustom: false,
  })
  const { toast } = useToast()

  // Fetch questions from Firebase
  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const questionsRef = ref(database, "questions")
      const snapshot = await get(questionsRef)

      if (snapshot.exists()) {
        const questionsData = snapshot.val()
        setQuestions(questionsData)
      } else {
        // If no questions in Firebase yet, use the default ones from the local file
        const { surveyQuestions } = await import("@/lib/survey-questions")
        setQuestions(surveyQuestions)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Асуултуудыг ачаалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveQuestions = async () => {
    setSaving(true)
    try {
      const questionsRef = ref(database, "questions")
      await set(questionsRef, questions)
      toast({
        title: "Амжилттай хадгаллаа",
        description: "Асуултууд амжилттай хадгалагдлаа",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      })
    } catch (error) {
      console.error("Error saving questions:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Асуултуудыг хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = () => {
    if (!newQuestion.text) {
      toast({
        title: "Асуулт оруулна уу",
        description: "Асуултын текст хоосон байж болохгүй",
        variant: "destructive",
      })
      return
    }

    if (newQuestion.options && newQuestion.options.some((opt) => !opt.text)) {
      toast({
        title: "Сонголтуудыг оруулна уу",
        description: "Бүх сонголтын текст оруулах шаардлагатай",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(0, ...questions.map((q) => q.id)) + 1
    const questionToAdd: Question = {
      id: newId,
      text: newQuestion.text || "",
      type: newQuestion.type as "single" | "multiple",
      options: (newQuestion.options as Option[]) || [],
      allowCustom: newQuestion.allowCustom || false,
    }

    setQuestions([...questions, questionToAdd])
    setNewQuestion({
      text: "",
      type: "single",
      options: [{ id: 1, text: "" }],
      allowCustom: false,
    })
    setActiveTab("list")

    toast({
      title: "Асуулт нэмэгдлээ",
      description: "Шинэ асуулт амжилттай нэмэгдлээ",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    })
  }

  const updateQuestion = () => {
    if (!editingQuestion) return

    if (!editingQuestion.text) {
      toast({
        title: "Асуулт оруулна уу",
        description: "Асуултын текст хоосон байж болохгүй",
        variant: "destructive",
      })
      return
    }

    if (editingQuestion.options.some((opt) => !opt.text)) {
      toast({
        title: "Сонголтуудыг оруулна уу",
        description: "Бүх сонголтын текст оруулах шаардлагатай",
        variant: "destructive",
      })
      return
    }

    const updatedQuestions = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q))

    setQuestions(updatedQuestions)
    setEditingQuestion(null)
    setActiveTab("list")

    toast({
      title: "Асуулт шинэчлэгдлээ",
      description: "Асуулт амжилттай шинэчлэгдлээ",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    })
  }

  const deleteQuestion = (id: number) => {
    const updatedQuestions = questions.filter((q) => q.id !== id)
    setQuestions(updatedQuestions)

    toast({
      title: "Асуулт устгагдлаа",
      description: "Асуулт амжилттай устгагдлаа",
    })
  }

  const moveQuestion = (id: number, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === questions.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const updatedQuestions = [...questions]
    const temp = updatedQuestions[index]
    updatedQuestions[index] = updatedQuestions[newIndex]
    updatedQuestions[newIndex] = temp

    setQuestions(updatedQuestions)
  }

  const duplicateQuestion = (question: Question) => {
    const newId = Math.max(0, ...questions.map((q) => q.id)) + 1
    const duplicatedQuestion: Question = {
      ...question,
      id: newId,
      text: `${question.text} (хуулбар)`,
    }

    setQuestions([...questions, duplicatedQuestion])

    toast({
      title: "Асуулт хуулагдлаа",
      description: "Асуулт амжилттай хуулагдлаа",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    })
  }

  const handleAddOption = (questionState: "new" | "edit") => {
    if (questionState === "new") {
      const options = newQuestion.options || []
      const newId = Math.max(0, ...options.map((o) => o.id)) + 1
      setNewQuestion({
        ...newQuestion,
        options: [...options, { id: newId, text: "" }],
      })
    } else if (editingQuestion) {
      const newId = Math.max(0, ...editingQuestion.options.map((o) => o.id)) + 1
      setEditingQuestion({
        ...editingQuestion,
        options: [...editingQuestion.options, { id: newId, text: "" }],
      })
    }
  }

  const handleRemoveOption = (questionState: "new" | "edit", optionId: number) => {
    if (questionState === "new") {
      const options = newQuestion.options || []
      if (options.length <= 1) return

      setNewQuestion({
        ...newQuestion,
        options: options.filter((o) => o.id !== optionId),
      })
    } else if (editingQuestion) {
      if (editingQuestion.options.length <= 1) return

      setEditingQuestion({
        ...editingQuestion,
        options: editingQuestion.options.filter((o) => o.id !== optionId),
      })
    }
  }

  const handleOptionTextChange = (questionState: "new" | "edit", optionId: number, text: string) => {
    if (questionState === "new") {
      const options = newQuestion.options || []
      setNewQuestion({
        ...newQuestion,
        options: options.map((o) => (o.id === optionId ? { ...o, text } : o)),
      })
    } else if (editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        options: editingQuestion.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Асуултуудыг ачаалж байна...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Судалгааны асуултууд</h2>
          <Badge variant="outline" className="ml-2">
            {questions.length} асуулт
          </Badge>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchQuestions} disabled={saving} className="flex-1 sm:flex-none">
            <RefreshCw className="mr-2 h-4 w-4" />
            Дахин ачаалах
          </Button>
          <Button
            onClick={saveQuestions}
            disabled={saving}
            className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Хадгалах
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Асуултын жагсаалт
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Шинэ асуулт нэмэх
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {questions.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <HelpCircle className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Асуулт байхгүй байна. Шинэ асуулт нэмнэ үү.</p>
                  <Button onClick={() => setActiveTab("add")} variant="outline" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Асуулт нэмэх
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-cyan-500/20 bg-slate-900/80 backdrop-blur-sm hover:bg-slate-900/90 transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shrink-0 mt-0.5"
                            >
                              #{index + 1}
                            </Badge>
                            <div>
                              <CardTitle className="text-base sm:text-lg break-words">{question.text}</CardTitle>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge
                                  variant={question.type === "single" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {question.type === "single" ? "Нэг сонголт" : "Олон сонголт"}
                                </Badge>
                                {question.allowCustom && (
                                  <Badge variant="outline" className="text-xs">
                                    Бусад сонголт
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2 sm:mt-0 sm:ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingQuestion(question)
                                setActiveTab("edit")
                              }}
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-cyan-500/20"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Засах</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateQuestion(question)}
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Хуулах</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestion(question.id, "up")}
                              disabled={index === 0}
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <MoveUp className="h-4 w-4" />
                              <span className="sr-only">Дээш</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestion(question.id, "down")}
                              disabled={index === questions.length - 1}
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <MoveDown className="h-4 w-4" />
                              <span className="sr-only">Доош</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Устгах</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-slate-900 border border-red-500/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Асуултыг устгах уу?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Энэ үйлдлийг буцаах боломжгүй. Энэ асуултыг устгаснаар өмнөх судалгааны хариултууд
                                    алдагдаж болзошгүй.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-slate-700 hover:bg-slate-800">
                                    Цуцлах
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteQuestion(question.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Устгах
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="mt-2">
                          <p className="text-xs font-medium text-slate-400 mb-2">Сонголтууд:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={option.id}
                                className="text-xs sm:text-sm bg-slate-800/50 px-3 py-2 rounded-md border border-slate-700/50 flex items-center gap-2"
                              >
                                <span className="text-xs text-slate-500 w-5 text-center">{optIndex + 1}.</span>
                                <span className="truncate">{option.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4 mt-4">
          <Card className="border-cyan-500/20 bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-cyan-400" />
                Шинэ асуулт нэмэх
              </CardTitle>
              <CardDescription>Судалгаанд шинэ асуулт нэмэх</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question-text">Асуултын текст</Label>
                <Textarea
                  id="question-text"
                  placeholder="Асуултын текстийг оруулна уу"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question-type">Асуултын төрөл</Label>
                  <Select
                    value={newQuestion.type}
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value as "single" | "multiple" })}
                  >
                    <SelectTrigger id="question-type" className="bg-slate-800/50 border-slate-700">
                      <SelectValue placeholder="Төрлийг сонгоно уу" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="single">Нэг сонголт</SelectItem>
                      <SelectItem value="multiple">Олон сонголт</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-custom" className="cursor-pointer">
                      "Бусад" сонголт зөвшөөрөх
                    </Label>
                    <Switch
                      id="allow-custom"
                      checked={newQuestion.allowCustom}
                      onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, allowCustom: checked })}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Хэрэглэгч өөрийн хариултыг оруулах боломжтой болно</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Сонголтууд</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddOption("new")}
                    className="h-8 border-cyan-500/30 hover:bg-cyan-500/10"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Сонголт нэмэх
                  </Button>
                </div>

                <div className="space-y-2">
                  {newQuestion.options?.map((option, index) => (
                    <div key={option.id} className="flex gap-2 items-center">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm text-muted-foreground">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`Сонголт ${index + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionTextChange("new", option.id, e.target.value)}
                        className="bg-slate-800/50 border-slate-700 focus:border-cyan-500/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption("new", option.id)}
                        disabled={(newQuestion.options?.length || 0) <= 1}
                        className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Устгах</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("list")} className="border-slate-700">
                Цуцлах
              </Button>
              <Button
                onClick={addQuestion}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Асуулт нэмэх
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4 mt-4">
          {editingQuestion && (
            <Card className="border-cyan-500/20 bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-cyan-400" />
                  Асуулт засах
                </CardTitle>
                <CardDescription>Одоо байгаа асуултыг засах</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-question-text">Асуултын текст</Label>
                  <Textarea
                    id="edit-question-text"
                    placeholder="Асуултын текстийг оруулна уу"
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                    className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-cyan-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-question-type">Асуултын төрөл</Label>
                    <Select
                      value={editingQuestion.type}
                      onValueChange={(value) =>
                        setEditingQuestion({ ...editingQuestion, type: value as "single" | "multiple" })
                      }
                    >
                      <SelectTrigger id="edit-question-type" className="bg-slate-800/50 border-slate-700">
                        <SelectValue placeholder="Төрлийг сонгоно уу" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="single">Нэг сонголт</SelectItem>
                        <SelectItem value="multiple">Олон сонголт</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-allow-custom" className="cursor-pointer">
                        "Бусад" сонголт зөвшөөрөх
                      </Label>
                      <Switch
                        id="edit-allow-custom"
                        checked={editingQuestion.allowCustom}
                        onCheckedChange={(checked) => setEditingQuestion({ ...editingQuestion, allowCustom: checked })}
                      />
                    </div>
                    <p className="text-xs text-slate-400">Хэрэглэгч өөрийн хариултыг оруулах боломжтой болно</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Сонголтууд</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddOption("edit")}
                      className="h-8 border-cyan-500/30 hover:bg-cyan-500/10"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Сонголт нэмэх
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {editingQuestion.options.map((option, index) => (
                      <div key={option.id} className="flex gap-2 items-center">
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm text-muted-foreground">
                          {index + 1}
                        </div>
                        <Input
                          placeholder={`Сонголт ${index + 1}`}
                          value={option.text}
                          onChange={(e) => handleOptionTextChange("edit", option.id, e.target.value)}
                          className="bg-slate-800/50 border-slate-700 focus:border-cyan-500/50"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption("edit", option.id)}
                          disabled={editingQuestion.options.length <= 1}
                          className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Устгах</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingQuestion(null)
                    setActiveTab("list")
                  }}
                  className="border-slate-700"
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={updateQuestion}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Хадгалах
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

