import Link from 'next/link'
import Image from 'next/image'
import { Truck } from 'lucide-react'

export default function AdminHeader() {
  return (
    <header className="bg-ios-bg-primary/95 border-b border-ios-separator shadow-ios-sm sticky top-0 z-50 backdrop-blur-xl backdrop-saturate-150">
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-3 active:opacity-70 transition-opacity"
        >
          <Image
            src="/FXBGCompost_logo.png"
            alt="FXBG Compost"
            width={160}
            height={80}
            className="h-10 w-auto"
            priority
          />
          <div className="text-ios-subheadline font-semibold text-gray-600 hidden sm:block">
            Admin
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-ios-subheadline text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Truck className="w-4 h-4" />
          <span className="hidden sm:inline">Driver</span>
        </Link>
      </div>
    </header>
  )
}
