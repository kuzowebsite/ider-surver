"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { app } from "@/lib/firebase"

export default function SetupPage() {
  const [config, setConfig] = useState({
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
  })

  const [envText, setEnvText] = useState("")
  const [currentConfig, setCurrentConfig] = useState<any>(null)

  useEffect(() => {
    // Одоогийн Firebase тохиргоог авах
    const currentFirebaseConfig = {
      apiKey: app.options.apiKey,
      authDomain: app.options.authDomain,
      databaseURL: app.options.databaseURL,
      projectId: app.options.projectId,
      storageBucket: app.options.storageBucket,
      messagingSenderId: app.options.messagingSenderId,
      appId: app.options.appId,
      measurementId: app.options.measurementId,
    }

    setCurrentConfig(currentFirebaseConfig)

    // Формыг одоогийн утгуудаар бөглөх
    setConfig(currentFirebaseConfig)

    // .env текстийг үүсгэх
    generateEnvText(currentFirebaseConfig)
  }, [])

  const generateEnvText = (configData: any) => {
    let text = ""
    Object.entries(configData).forEach(([key, value]) => {
      if (value) {
        // camelCase-г SCREAMING_SNAKE_CASE болгох
        const envKey = "NEXT_PUBLIC_FIREBASE_" + key.replace(/([A-Z])/g, "_$1").toUpperCase()
        text += `${envKey}=${value}
`
      }
    })
    setEnvText(text)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig((prev) => {
      const newConfig = { ...prev, [name]: value }
      generateEnvText(newConfig)
      return newConfig
    })
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Firebase тохиргоо</CardTitle>
          <CardDescription>Firebase холболтыг тохируулахад энэ хуудсыг ашиглана</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Одоогийн Firebase тохиргоо</h3>
              {currentConfig && (
                <div className="p-4 bg-muted rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(currentConfig, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" name="apiKey" value={config.apiKey} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authDomain">Auth Domain</Label>
                  <Input id="authDomain" name="authDomain" value={config.authDomain} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="databaseURL">Database URL (чухал!)</Label>
                <Input
                  id="databaseURL"
                  name="databaseURL"
                  value={config.databaseURL}
                  onChange={handleInputChange}
                  className="border-2 border-primary"
                />
                <p className="text-sm text-muted-foreground">
                  Энэ талбар Realtime Database ажиллуулахад заавал шаардлагатай. Формат:
                  https://your-project-id.firebaseio.com
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project ID (чухал!)</Label>
                  <Input
                    id="projectId"
                    name="projectId"
                    value={config.projectId}
                    onChange={handleInputChange}
                    className="border-2 border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageBucket">Storage Bucket</Label>
                  <Input
                    id="storageBucket"
                    name="storageBucket"
                    value={config.storageBucket}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
                  <Input
                    id="messagingSenderId"
                    name="messagingSenderId"
                    value={config.messagingSenderId}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appId">App ID</Label>
                  <Input id="appId" name="appId" value={config.appId} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurementId">Measurement ID</Label>
                <Input
                  id="measurementId"
                  name="measurementId"
                  value={config.measurementId}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="envText">.env файлд зориулсан орчны хувьсагчид</Label>
              <Textarea id="envText" value={envText} readOnly className="h-40 font-mono" />
              <p className="text-sm text-muted-foreground">
                Эдгээр хувьсагчдыг төслийн үндсэн хавтаст байрлах .env.local файлд хуулж тавина
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Буцах
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(envText)
              alert("Орчны хувьсагчид хавчуургад хуулагдлаа")
            }}
          >
            Хувьсагчдыг хуулах
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

