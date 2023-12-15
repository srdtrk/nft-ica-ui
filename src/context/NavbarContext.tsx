import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react'

interface NavbarContextType {
  showBackButton: boolean
  backButtonAction: () => void
  provideBackButton: (action: () => void) => void
  hideBackButton: () => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const useNavbarContext = (): NavbarContextType => {
  const context = useContext(NavbarContext)
  if (context === undefined) throw new Error('useNavbarContext must be used within a NavbarProvider')
  return context
}

interface NavbarProviderProps {
  children: ReactNode
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const [showBackButton, setShowBackButton] = useState(false)
  const [backButtonAction, setBackButtonAction] = useState<() => void>(() => () => {})

  const provideBackButton = useCallback((action: () => void) => {
    setShowBackButton(true)
    setBackButtonAction(() => action)
  }, [])

  const hideBackButton = useCallback(() => {
    setShowBackButton(false)
    setBackButtonAction(() => () => {})
  }, [])

  return (
    <NavbarContext.Provider value={{ showBackButton, backButtonAction, provideBackButton, hideBackButton }}>
      {children}
    </NavbarContext.Provider>
  )
}

