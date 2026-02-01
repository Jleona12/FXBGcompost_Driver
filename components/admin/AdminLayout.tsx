'use client'

import { useEffect, useState } from 'react'
import PasswordGate from './PasswordGate'
import AdminNav from './AdminNav'
import { Loader2 } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      setIsAuthenticated(response.ok)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  // Loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-bg-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-fxbg-green" />
      </div>
    )
  }

  // Show password gate if not authenticated
  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />
  }

  // Authenticated - show admin layout
  return (
    <div className="min-h-screen bg-ios-bg-secondary">
      <AdminNav onLogout={handleLogout} />

      {/* Main content area */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
