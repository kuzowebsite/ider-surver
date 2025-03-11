"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Question } from "@/lib/survey-questions"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
  type TooltipProps,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"

interface AdminSurveyChartsProps {
  surveys: any[]
  questions: Question[]
  isMobile?: boolean
}

// Более яркие и контрастные цвета для лучшей различимости
const COLORS = [
  "#4f46e5", // Indigo
  "#2563eb", // Blue
  "#0ea5e9", // Light Blue
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#84cc16", // Lime
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
]

// Кастомный компонент для тултипа с более понятной информацией
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm">
          Хариултын тоо: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    )
  }

  return null
}

// Кастомный компонент для тултипа круговой диаграммы
const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">
          Хариултын тоо: <span className="font-bold">{data.count}</span>
        </p>
        <p className="text-sm">
          Хувь: <span className="font-bold">{((data.count / data.total) * 100).toFixed(1)}%</span>
        </p>
      </div>
    )
  }

  return null
}

export default function AdminSurveyCharts({ surveys, questions, isMobile = false }: AdminSurveyChartsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(1)
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  const getQuestionData = (questionId: number) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return { data: [], totalResponses: 0 }

    // Initialize counts for each option
    const optionCounts = question.options.reduce(
      (acc, option) => {
        acc[option.id] = {
          id: option.id,
          name: option.text,
          count: 0,
          total: 0, // Будет установлено позже
        }
        return acc
      },
      {} as Record<number, { id: number; name: string; count: number; total: number }>,
    )

    // Count responses
    let totalResponses = 0
    surveys.forEach((survey) => {
      if (!survey.answers || !survey.answers[questionId]) return

      const answerData = survey.answers[questionId]
      totalResponses++

      if (question.type === "single") {
        const optionId = answerData.answer.optionId
        if (optionCounts[optionId]) {
          optionCounts[optionId].count += 1
        }
      } else {
        // Multiple choice
        const answers = answerData.answer
        answers.forEach((answer: any) => {
          const optionId = answer.optionId
          if (optionCounts[optionId]) {
            optionCounts[optionId].count += 1
          }
        })
      }
    })

    // Set total for percentage calculations
    const data = Object.values(optionCounts).map((item) => ({
      ...item,
      total: totalResponses,
      percentage: totalResponses > 0 ? ((item.count / totalResponses) * 100).toFixed(1) + "%" : "0%",
    }))

    return { data, totalResponses }
  }

  const { data: chartData, totalResponses } = getQuestionData(selectedQuestion)
  const currentQuestion = questions.find((q) => q.id === selectedQuestion)

  // Сортируем данные по количеству ответов (от большего к меньшему)
  const sortedChartData = [...chartData].sort((a, b) => b.count - a.count)

  // Функция для форматирования текста меток на графиках
  const formatLabel = (text: string) => {
    // Если текст длиннее 20 символов, обрезаем его и добавляем многоточие
    if (text.length > 20) {
      return text.substring(0, 20) + "..."
    }
    return text
  }

  // Функция для отображения процентов на круговой диаграмме
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

    // Показываем проценты только если они больше 5%
    if (percent < 0.05) return null

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="sticky top-0 z-10 bg-background border-b">
          <CardTitle>Асуултаар харах</CardTitle>
          <CardDescription>Судалгааны хариултуудын статистик</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="sticky top-[120px] z-10 bg-background p-4 sm:p-0 border-b sm:border-0">
            {isMobile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-select">Асуулт сонгох</Label>
                  <Select
                    value={selectedQuestion.toString()}
                    onValueChange={(value) => setSelectedQuestion(Number.parseInt(value))}
                  >
                    <SelectTrigger id="question-select">
                      <SelectValue placeholder="Асуулт сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions.map((question) => (
                        <SelectItem key={question.id} value={question.id.toString()}>
                          Асуулт {question.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Tabs
                    value={chartType}
                    onValueChange={(value) => setChartType(value as "bar" | "pie")}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="bar">Баганан</TabsTrigger>
                      <TabsTrigger value="pie">Дугуй</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs
                  defaultValue={selectedQuestion.toString()}
                  onValueChange={(value) => setSelectedQuestion(Number.parseInt(value))}
                  className="w-full"
                >
                  <TabsList className="flex flex-wrap">
                    {questions.map((question) => (
                      <TabsTrigger key={question.id} value={question.id.toString()} className="text-xs md:text-sm">
                        Асуулт {question.id}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="flex justify-center">
                  <Tabs
                    value={chartType}
                    onValueChange={(value) => setChartType(value as "bar" | "pie")}
                    className="w-64"
                  >
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="bar">Баганан график</TabsTrigger>
                      <TabsTrigger value="pie">Дугуй график</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-0">
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-medium line-clamp-2">{currentQuestion?.text}</h3>
                <Badge variant="outline" className="shrink-0">
                  {currentQuestion?.type === "single" ? "Нэг сонголт" : "Олон сонголт"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Нийт хариулсан: <span className="font-medium">{totalResponses}</span> хэрэглэгч
                  {totalResponses > 0 && ` (${Math.round((totalResponses / surveys.length) * 100)}% оролцсон)`}
                </p>
              </div>
            </div>

            {chartType === "bar" ? (
              <div className="space-y-6">
                <div className={isMobile ? "h-[60vh]" : "h-[400px]"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedChartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={isMobile ? 120 : 150}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        tickFormatter={formatLabel}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#4f46e5">
                        <LabelList
                          dataKey="count"
                          position="right"
                          style={{
                            fill: "#4f46e5",
                            fontWeight: "bold",
                            fontSize: isMobile ? 10 : 12,
                          }}
                        />
                        {sortedChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Таблица с данными */}
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Хариулт</th>
                          <th className="px-4 py-2 text-right">Тоо</th>
                          <th className="px-4 py-2 text-right">Хувь</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedChartData.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2 text-right font-medium">{item.count}</td>
                            <td className="px-4 py-2 text-right font-medium">{item.percentage}</td>
                          </tr>
                        ))}
                        {totalResponses > 0 && (
                          <tr className="border-t bg-muted">
                            <td className="px-4 py-2 font-medium">Нийт</td>
                            <td className="px-4 py-2 text-right font-medium">{totalResponses}</td>
                            <td className="px-4 py-2 text-right font-medium">100%</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={isMobile ? "h-[50vh]" : "h-[400px]"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sortedChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={isMobile ? "40%" : "70%"}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                      >
                        {sortedChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        layout={isMobile ? "horizontal" : "vertical"}
                        verticalAlign={isMobile ? "bottom" : "middle"}
                        align={isMobile ? "center" : "right"}
                        wrapperStyle={isMobile ? { fontSize: "10px", bottom: 0 } : { fontSize: "12px", right: 0 }}
                        formatter={(value) => formatLabel(value as string)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Добавляем таблицу и для круговой диаграммы */}
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Хариулт</th>
                          <th className="px-4 py-2 text-right">Тоо</th>
                          <th className="px-4 py-2 text-right">Хувь</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedChartData.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2 text-right font-medium">{item.count}</td>
                            <td className="px-4 py-2 text-right font-medium">{item.percentage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="text-xl sm:text-2xl font-bold">{surveys.length}</div>
            <p className="text-xs text-muted-foreground">Нийт судалгаа</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5">
          <CardContent className="p-4">
            <div className="text-xl sm:text-2xl font-bold">{surveys.filter((s) => s.device?.isMobile).length}</div>
            <p className="text-xs text-muted-foreground">Гар утаснаас</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5">
          <CardContent className="p-4">
            <div className="text-xl sm:text-2xl font-bold">{surveys.filter((s) => !s.device?.isMobile).length}</div>
            <p className="text-xs text-muted-foreground">Компьютерээс</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5">
          <CardContent className="p-4">
            <div className="text-xl sm:text-2xl font-bold">
              {surveys.length > 0
                ? (
                    (surveys.reduce((sum, survey) => {
                      const answeredQuestions = Object.keys(survey.answers || {}).length
                      return sum + answeredQuestions
                    }, 0) /
                      (surveys.length * questions.length)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Дундаж гүйцэтгэл</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

