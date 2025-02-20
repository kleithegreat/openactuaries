'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { User } from 'next-auth'
import { ArrowRight } from 'lucide-react'

interface StartPracticingButtonProps {
  user: User | null | undefined
  customClass?: string
}

export function StartPracticingButton({ user, customClass }: StartPracticingButtonProps) {
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

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

  const buttonText = user 
    ? (isNewUser ? "Complete Setup" : "Go to Dashboard") 
    : "Start Practicing";

  return (
    <Button 
      size="lg" 
      className={`relative group ${customClass || 'bg-primary hover:bg-primary-dark'} w-full sm:w-auto transition-all duration-200`}
      onClick={handleStartPracticing}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="flex items-center justify-center gap-1.5">
        {buttonText}
        <ArrowRight 
          className={`h-4 w-4 transition-transform duration-200 ease-in-out ${isHovered ? 'transform translate-x-0.5' : ''}`} 
        />
      </span>
    </Button>
  )
}