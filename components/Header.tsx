import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-ios-bg-primary/95 border-b border-ios-separator shadow-ios-sm sticky top-0 z-50 backdrop-blur-xl backdrop-saturate-150">
      <div className="container mx-auto px-4 py-3.5">
        <Link
          href="/"
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
            Driver App
          </div>
        </Link>
      </div>
    </header>
  )
}
