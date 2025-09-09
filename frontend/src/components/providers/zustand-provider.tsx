'use client'

import { ReactNode } from 'react'

interface ZustandProviderProps {
  children: ReactNode
}

export function ZustandProvider({ children }: ZustandProviderProps) {
  // Zustand stores are automatically hydrated from localStorage
  // No additional setup needed for persistence
  return <>{children}</>
}