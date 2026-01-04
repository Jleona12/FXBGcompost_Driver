import RouteList from '@/components/RouteList'

export default function Home() {
  return (
    <main className="min-h-screen bg-ios-bg-secondary">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-ios-large-title font-bold text-fxbg-dark-brown mb-2 tracking-tight">
            Driver Dashboard
          </h1>
          <p className="text-ios-body text-ios-label-secondary">
            Select a route to view stops and begin pickups
          </p>
        </div>

        <RouteList />
      </div>
    </main>
  )
}
