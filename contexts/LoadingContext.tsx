'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

interface LoadingOptions {
  minDuration?: number // Thời gian tối thiểu hiển thị loading (ms)
  timeout?: number // Thời gian tối đa hiển thị loading (ms)
}

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean, options?: LoadingOptions) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const loadingStartTime = useRef<number | null>(null)
  const currentOptions = useRef<LoadingOptions>({
    minDuration: 400,
    timeout: 30000
  })

  const setLoading = (loading: boolean, options?: LoadingOptions) => {
    if (options) {
      currentOptions.current = {
        ...currentOptions.current,
        ...options
      }
    }

    if (loading) {
      loadingStartTime.current = Date.now()
      setIsLoading(true)
    } else {
      const elapsedTime = Date.now() - (loadingStartTime.current || 0)
      const remainingTime = Math.max(0, (currentOptions.current.minDuration || 400) - elapsedTime)

      setTimeout(() => {
        setIsLoading(false)
      }, remainingTime)
    }
  }

  // Auto disable loading after timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false)
      }, currentOptions.current.timeout || 30000)
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading])

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
} 