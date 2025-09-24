import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options) => res.cookies.set({ name, value, ...options }),
      remove: (name: string, options) => res.cookies.set({ name, value: "", ...options }),
    },
  })

  // Touch the session to refresh tokens if needed
  await supabase.auth.getUser().catch(() => {})
  return res
}

export const config = {
  // Protect these routes by middleware refresh coverage; actual protection via server code
  matcher: ["/dashboard/:path*", "/profile/:path*", "/api/:path*"],
}
