import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { image_url, prompt, metadata } = body || {}

  const { data, error } = await supabase
    .from("versions")
    .insert({
      project_id: params.id,
      user_id: user.id,
      image_url,
      prompt,
      metadata,
    })
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
