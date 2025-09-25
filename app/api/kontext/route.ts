import { NextResponse } from "next/server"
// IMPORTANT: We follow the project's Fal integration guideline to use @fal-ai/serverless.
import { fal } from '@fal-ai/client';


export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const prompt = String(form.get("prompt") || "")
    const strength = form.get("strength") ? Number(form.get("strength")) : undefined
    const guidance = form.get("guidance") ? Number(form.get("guidance")) : undefined
    const seed = form.get("seed") ? Number(form.get("seed")) : undefined
    const file = form.get("image") as File | null

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
    }
    if (!file) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 })
    }

    // Convert uploaded image to a Data URI so it can be sent directly to Fal
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const imageDataUri = `data:${file.type};base64,${base64}`

    // Configure Fal client using environment variable (server-side only)
    const falKey = process.env.FAL_KEY
    if (!falKey) {
      // Keeping error explicit helps users configure env vars in Project Settings
      return NextResponse.json({ error: "Missing FAL_KEY environment variable." }, { status: 500 })
    }

    const client = fal({ credentials: falKey })

    // Submit job to FLUX Kontext
    // We pass minimal inputs: prompt + image_url (Data URI).
    // Optional params like strength/guidance/seed are forwarded if present.
    const result = await client.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        prompt,
        image_url: imageDataUri,
        ...(typeof strength === "number" ? { strength } : {}),
        ...(typeof guidance === "number" ? { guidance } : {}),
        ...(typeof seed === "number" ? { seed } : {}),
      },
      // You can enable logs or webhooks if needed:
      // logs: true,
    })

    // The result schema can vary; normalize common fields.
    // Try common locations for result image(s):
    const outputUrl =
      (result as any)?.image?.url ||
      (result as any)?.output?.[0]?.url ||
      (result as any)?.images?.[0]?.url ||
      (result as any)?.url ||
      null

    if (!outputUrl) {
      return NextResponse.json({ error: "FAL response did not return an image URL.", raw: result }, { status: 502 })
    }

    return NextResponse.json({ url: outputUrl, raw: result })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process image with FLUX Kontext.", details: err?.message },
      { status: 500 },
    )
  }
}
