"use client"

import { useEffect, useState } from "react"
import { app, database } from "@/lib/firebase"
import { ref, set, get } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setStatus("loading")
    setErrorMessage(null)

    try {
      // Firebase тохиргоог авах
      const firebaseConfig = {
        projectId: app.options.projectId,
        databaseURL: app.options.databaseURL,
        authDomain: app.options.authDomain,
      }
      setConfig(firebaseConfig)

      // Тестийн өгөгдөл бичиж, уншиж үзэх
      const testRef = ref(database, "connection_test")
      const testData = { timestamp: Date.now(), message: "Холболтын тест" }

      await set(testRef, testData)
      const snapshot = await get(testRef)

      if (snapshot.exists()) {
        setStatus("connected")
      } else {
        throw new Error("Тестийн өгөгдлийг уншиж чадсангүй")
      }
    } catch (error: any) {
      console.error("Firebase холболтын алдаа:", error)
      setStatus("error")
      setErrorMessage(error.message || "Тодорхойгүй алдаа")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase холболтын статус</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Статус:</span>
            {status === "loading" && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Холболт шалгаж байна...</span>
              </div>
            )}
            {status === "connected" && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <span>Холбогдсон</span>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span>Холболтын алдаа</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              <p className="font-medium">Алдаа:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {config && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-medium mb-2">Firebase тохиргоо:</p>
              <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(config, null, 2)}</pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={checkConnection} variant="outline" size="sm">
              Холболт шалгах
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href="/setup">Firebase тохируулах</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

