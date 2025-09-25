import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Prevent static generation for this page since it uses Supabase
export const dynamic = 'force-dynamic'

async function updateProfile(formData: FormData) {
  "use server"
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/signin")

  const full_name = String(formData.get("full_name") || "")
  const avatar_url = String(formData.get("avatar_url") || "")

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, avatar_url, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) {
    console.error("[v0] Update profile error:", error.message)
    throw new Error("Failed to update profile")
  }
  revalidatePath("/profile")
}

export default async function ProfilePage() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/signin")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  return (
    <main className="mx-auto max-w-xl p-6">
      <form
        action={updateProfile}
        className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md"
      >
        <h1 className="text-2xl font-semibold text-foreground">Your Profile</h1>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-muted-foreground">Full name</span>
            <input
              name="full_name"
              defaultValue={(profile as any)?.full_name || ""}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground"
              placeholder="Ada Lovelace"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm text-muted-foreground">Avatar URL</span>
            <input
              name="avatar_url"
              defaultValue={(profile as any)?.avatar_url || ""}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground"
              placeholder="https://..."
            />
          </label>
          <button className="mt-2 inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-foreground hover:bg-card/80 backdrop-blur-md">
            Save changes
          </button>
        </div>
      </form>
    </main>
  )
}
