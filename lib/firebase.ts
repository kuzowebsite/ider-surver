"use client"

import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAuth } from "firebase/auth"
import { useState, useEffect } from "react"

// Используем предоставленную конфигурацию Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmX_0zW98U4P2sk_pdp9Stqr8Zv5IxZc0",
  authDomain: "crypto-78b68.firebaseapp.com",
  databaseURL: "https://crypto-78b68-default-rtdb.firebaseio.com",
  projectId: "crypto-78b68",
  storageBucket: "crypto-78b68.firebasestorage.app",
  messagingSenderId: "506662617204",
  appId: "1:506662617204:web:85110d4e4fa11a53a51121",
  measurementId: "G-VTPTEFE8H0",
}

// Выводим конфигурацию в консоль для отладки
console.log("Firebase Config:", {
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId,
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const auth = getAuth(app)

// Добавляем хук useDatabase для использования в компонентах
export function useDatabase() {
  const [db, setDb] = useState(database)

  useEffect(() => {
    // Проверяем, что база данных инициализирована
    if (!db) {
      console.error("Firebase database is not initialized")
      setDb(getDatabase(app))
    }
  }, [db])

  return db
}

export { app, database, auth }

