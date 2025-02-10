"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"

interface AnimatedAlertProps {
  message: string
  variant?: "default" | "destructive" | "green" | "rose"
  onClose?: () => void
}

export function AnimatedAlert({ message, variant = "default", onClose }: AnimatedAlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message])

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setShouldRender(false)
      onClose?.()
    }
  }

  if (!shouldRender) return null

  return (
    <Alert
      variant={variant}
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "-translate-y-2 opacity-0"
      }`}
      onTransitionEnd={handleAnimationEnd}
    >
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}