import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase.from("projects").select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, description } = body || {}
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      description,
      user_id: user.id,
    })
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
