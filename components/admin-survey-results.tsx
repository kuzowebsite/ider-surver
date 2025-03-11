"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Question } from "@/lib/survey-questions"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AdminSurveyResultsProps {
  surveys: any[]
  questions: Question[]
  isMobile?: boolean
}

export default function AdminSurveyResults({ surveys, questions, isMobile = false }: AdminSurveyResultsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = isMobile ? 5 : 10

  const totalPages = Math.ceil(surveys.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSurveys = surveys.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleString()
  }

  const renderAnswerValue = (questionId: number, answerData: any) => {
    if (!answerData) return "Хариулаагүй"

    const question = questions.find((q) => q.id === questionId)
    if (!question) return "Асуулт олдсонгүй"

    if (question.type === "single") {
      const answer = answerData.answer
      let result = answer.text

      if (answer.customText) {
        result += ` - ${answer.customText}`
      }

      return result
    } else {
      // Multiple choice
      const answers = answerData.answer
      return (
        <ul className="list-disc pl-5">
          {answers.map((answer: any, index: number) => (
            <li key={index}>
              {answer.text}
              {answer.customText && <span className="italic"> - {answer.customText}</span>}
            </li>
          ))}
        </ul>
      )
    }
  }

  return (
    <div>
      {currentSurveys.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Судалгааны хариулт олдсонгүй.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {currentSurveys.map((survey, index) => (
              <Accordion type="single" collapsible key={survey.id} className="border rounded-lg overflow-hidden">
                <AccordionItem value="item-1" className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">Судалгаа #{startIndex + index + 1}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(survey.timestamp)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 pb-4">
                      {isMobile ? (
                        <div className="space-y-4">
                          {questions.map((question) => (
                            <div key={question.id} className="border-b pb-3">
                              <h3 className="font-medium text-sm mb-1">{question.text}</h3>
                              <div className="text-sm">
                                {survey.answers && survey.answers[question.id]
                                  ? renderAnswerValue(question.id, survey.answers[question.id])
                                  : "Хариулаагүй"}
                              </div>
                            </div>
                          ))}
                          <div className="border-b pb-3">
                            <h3 className="font-medium text-sm mb-1">Төхөөрөмж</h3>
                            <div className="text-sm">
                              {survey.device ? (
                                <div>
                                  <p>
                                    Хэмжээ: {survey.device.width}x{survey.device.height}
                                  </p>
                                  <p>Төрөл: {survey.device.isMobile ? "Гар утас" : "Компьютер"}</p>
                                </div>
                              ) : (
                                "Мэдээлэл байхгүй"
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-[500px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/2">Асуулт</TableHead>
                                <TableHead>Хариулт</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {questions.map((question) => (
                                <TableRow key={question.id}>
                                  <TableCell className="align-top font-medium">{question.text}</TableCell>
                                  <TableCell>
                                    {survey.answers && survey.answers[question.id]
                                      ? renderAnswerValue(question.id, survey.answers[question.id])
                                      : "Хариулаагүй"}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell className="font-medium">Төхөөрөмж</TableCell>
                                <TableCell>
                                  {survey.device ? (
                                    <div>
                                      <p>
                                        Хэмжээ: {survey.device.width}x{survey.device.height}
                                      </p>
                                      <p>Төрөл: {survey.device.isMobile ? "Гар утас" : "Компьютер"}</p>
                                    </div>
                                  ) : (
                                    "Мэдээлэл байхгүй"
                                  )}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {!isMobile &&
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}

