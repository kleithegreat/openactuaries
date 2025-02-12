'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { User } from 'next-auth'

interface StartPracticingButtonProps {
  user: User | null | undefined
}

export function StartPracticingButton({ user }: StartPracticingButtonProps) {
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(true)

  useEffect(() => {
    if (user) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          setIsNewUser(!data.goalType && !data.goalAmount && (!data.examRegistrations || data.examRegistrations.length === 0))
        })
        .catch(err => console.error('Error fetching profile:', err))
    }
  }, [user])

  const handleStartPracticing = () => {
    if (user) {
      if (isNewUser) {
        router.push('/setup')
      } else {
        router.push('/home')
      }
    } else {
      router.push('/login')
    }
  }

  return (
    <Button 
      size="lg" 
      className="bg-sky-900 hover:bg-sky-900"
      onClick={handleStartPracticing}
    >
      {user ? (isNewUser ? "Complete Setup" : "Go to my home") : "Start Practicing"}
    </Button>
  )
} 