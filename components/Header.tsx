import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-ios-bg-primary border-b border-ios-separator shadow-ios-sm sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/FXBGCompost_logo.png"
            alt="FXBG Compost"
            width={160}
            height={80}
            className="h-10 w-auto"
            priority
          />
          <div className="text-ios-subheadline font-semibold text-ios-label-secondary hidden sm:block">
            Driver App
          </div>
        </Link>
      </div>
    </header>
  )
}
