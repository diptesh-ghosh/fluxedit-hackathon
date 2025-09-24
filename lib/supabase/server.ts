import { cookies, headers } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

const _supabaseServer: ReturnType<typeof createServerClient> | null = null

export function getSupabaseServer() {
  // Recreate per request to get fresh cookie jar, but cache within same invocation
  const cookieStore = cookies()
  const headerStore = headers()

  const cookieAdapter = {
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(name: string, value: string, options: CookieOptions) {
      // Next.js captures set-cookie via headers
      headerStore
      cookieStore.set({ name, value, ...options })
    },
    remove(name: string, options: CookieOptions) {
      cookieStore.set({ name, value: "", ...options })
    },
  }

  // Always return a fresh client per request in app router contexts
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: () => cookieAdapter,
  })
}
