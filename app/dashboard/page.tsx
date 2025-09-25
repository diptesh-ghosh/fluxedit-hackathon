import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"

// Prevent static generation for this page since it uses Supabase
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Your projects and version history will appear here.
        </p>
      </section>
    </main>
  )
}
