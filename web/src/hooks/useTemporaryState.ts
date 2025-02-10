import { useState, useEffect } from 'react'

export function useTemporaryState<T>(initialState: T, duration: number = 3000): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialState)

  useEffect(() => {
    if (state) {
      const timer = setTimeout(() => {
        setState(initialState)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [state, initialState, duration])

  return [state, setState]
}