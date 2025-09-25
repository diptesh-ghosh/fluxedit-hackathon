import { AuthButtons } from "@/components/auth/auth-buttons"

// Prevent static generation for this page since it uses Supabase
export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md">
        <h1 className="mb-2 text-balance text-2xl font-semibold text-foreground">Sign in to FluxEdit</h1>
        <p className="mb-6 text-muted-foreground">Use your Google account to continue.</p>
        <AuthButtons />
      </div>
    </main>
  )
}
