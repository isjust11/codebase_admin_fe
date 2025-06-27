'use client'

import { useLoading } from '@/contexts/LoadingContext'

export default function LoadingIndicator() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="text-white">Đang tải...</span>
      </div>
    </div>
  )
} 