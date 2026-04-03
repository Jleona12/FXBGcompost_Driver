import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </>
  )
}
