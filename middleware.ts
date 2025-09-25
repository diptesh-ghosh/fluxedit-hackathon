import { NextResponse, type NextRequest } from "next/server"

// HACKATHON MODE: Middleware disabled to prevent auth failures
export async function middleware(req: NextRequest) {
  // Simply pass through all requests without auth checks
  return NextResponse.next()
}

export const config = {
  // HACKATHON MODE: Disable middleware for all routes
  matcher: [],
  // Original matcher (disabled): ["/dashboard/:path*", "/profile/:path*", "/api/:path*"]
}
