import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, versions(*)")
    .eq("id", params.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: project })
}
