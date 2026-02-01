'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Users,
  Route,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Truck,
  ClipboardCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AdminNavProps {
  onLogout: () => void
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/routes', label: 'Routes', icon: Route },
  { href: '/admin/pickups', label: 'Pickups', icon: ClipboardCheck },
]

export default function AdminNav({ onLogout }: AdminNavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      onLogout()
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation - Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-ios-separator flex-col z-40">
        <div className="p-4 border-b border-ios-separator">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/FXBGCompost_logo.png"
              alt="FXBG Compost"
              width={120}
              height={60}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <div className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-ios-body transition-colors',
                  active
                    ? 'bg-fxbg-green/10 text-fxbg-green font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-ios-separator space-y-2">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-fxbg-green hover:bg-fxbg-green/10"
            >
              <Truck className="w-5 h-5 mr-3" />
              Driver View
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation - Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-ios-separator z-50 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/FXBGCompost_logo.png"
              alt="FXBG Compost"
              width={120}
              height={60}
              className="h-8 w-auto"
            />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel - Full Screen Slide */}
      <div
        className={cn(
          'md:hidden fixed top-16 left-0 right-0 bottom-0 bg-white z-40 transform transition-transform duration-300 ease-out overflow-y-auto',
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="p-6">
          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 px-4 py-4 rounded-2xl text-lg transition-all active:scale-[0.98]',
                    active
                      ? 'bg-fxbg-green text-white font-semibold shadow-lg'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    active ? 'bg-white/20' : 'bg-white'
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200" />

          {/* Secondary Actions */}
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-lg text-gray-700 bg-gray-50 hover:bg-fxbg-green/10 hover:text-fxbg-green active:bg-fxbg-green/20 transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <span>Switch to Driver View</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-lg text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all active:scale-[0.98] w-full text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
