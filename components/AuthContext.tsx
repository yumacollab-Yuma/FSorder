'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

const AuthContext = createContext<{
  password: string
  setPassword: (p: string) => void
  authed: boolean
  setAuthed: (a: boolean) => void
}>({ password: '', setPassword: () => {}, authed: false, setAuthed: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  return (
    <AuthContext.Provider value={{ password, setPassword, authed, setAuthed }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
