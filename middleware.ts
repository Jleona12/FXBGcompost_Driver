import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin_auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check for the auth endpoint itself (login/logout/check)
  if (pathname === '/api/admin/auth') {
    return NextResponse.next()
  }

  // Validate admin cookie on all /api/admin/* routes
  const authCookie = request.cookies.get(COOKIE_NAME)

  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/admin/:path*',
}
