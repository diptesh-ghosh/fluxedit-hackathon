"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type UserInfo = {
  id: string
  email?: string
  user_metadata?: { name?: string; full_name?: string; avatar_url?: string }
}

export function AuthButtons() {
  const supabase = getSupabaseBrowser()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser((data?.user as any) || null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser((session?.user as any) || null)
    })
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [supabase])

  const signInWithGoogle = async () => {
    const redirectTo = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-(--glass-border) bg-(--glass-bg)/50 px-3 py-2 backdrop-blur-md">
        <div className="size-2 animate-pulse rounded-full bg-(--accent)" />
        <span className="text-sm text-(--muted-foreground)">Loading session…</span>
      </div>
    )
  }

  if (!user) {
    return (
      <Button
        onClick={signInWithGoogle}
        className="rounded-xl border border-(--glass-border) bg-(--glass-bg) text-(--foreground) hover:bg-(--glass-bg-hover) backdrop-blur-md"
        variant="outline"
      >
        Continue with Google
      </Button>
    )
  }

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "User"

  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--glass-border) bg-(--glass-bg)/60 px-3 py-2 backdrop-blur-md">
      <Avatar className="size-7 ring-1 ring-(--glass-border)">
        <AvatarImage
          alt="User avatar"
          src={user.user_metadata?.avatar_url || "/placeholder.svg?height=64&width=64&query=user-avatar"}
        />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm text-(--muted-foreground)">{name}</span>
      <Button onClick={signOut} size="sm" variant="ghost" className="ml-2">
        Sign out
      </Button>
    </div>
  )
}
