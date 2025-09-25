import { cookies, headers } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

const _supabaseServer: ReturnType<typeof createServerClient> | null = null

export function getSupabaseServer() {
  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client if Supabase is not configured
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null })
      }
    } as any
  }

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
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: () => cookieAdapter,
  })
}
