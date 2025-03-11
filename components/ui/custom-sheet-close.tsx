"use client"

import type React from "react"

import { useRef } from "react"
import { SheetClose } from "@/components/ui/sheet"

interface CustomSheetCloseProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
}

export function CustomSheetClose({ onClick, children, className, disabled, variant }: CustomSheetCloseProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    onClick()
    // Use a small timeout to ensure the onClick executes before closing
    setTimeout(() => {
      if (closeRef.current) {
        closeRef.current.click()
      }
    }, 10)
  }

  return (
    <>
      <button onClick={handleClick} className={className} disabled={disabled} data-variant={variant}>
        {children}
      </button>
      <SheetClose ref={closeRef} className="hidden" />
    </>
  )
}

