"use client"

import React, { createContext, useContext, useState } from "react"

type SidebarRefreshContextType = {
  refreshTrigger: number
  triggerRefresh: (newSessionTitle?: string | null ) => void
  newSessionTitle: string | null | undefined
}

const SidebarRefreshContext = createContext<SidebarRefreshContextType | null>(null)

export function SidebarRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [newSessionTitle, setNewSessionTitle] = useState<string | null | undefined>(null)

  const triggerRefresh = (newSessionTitle?: string | null ) => {
    setRefreshTrigger(prev => prev + 1)
    setNewSessionTitle(newSessionTitle)
  }

  return (
    <SidebarRefreshContext.Provider value={{ refreshTrigger, triggerRefresh, newSessionTitle }}>
      {children}
    </SidebarRefreshContext.Provider>
  )
}

export function useSidebarRefresh() {
  const context = useContext(SidebarRefreshContext)
  if (!context) {
    throw new Error("useSidebarRefresh must be used within a SidebarRefreshProvider")
  }
  return context
}