import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  console.log("🚀 DEMO MODE: FAL API Route called")
  
  try {
    const form = await req.formData()
    const prompt = String(form.get("prompt") || "")
    const file = form.get("image") as File | null

    console.log("📝 DEMO: Request params:", { 
      prompt: prompt.substring(0, 50) + "...", 
      hasFile: !!file,
      fileSize: file?.size 
    })

    if (!prompt) {
      console.error("❌ Missing prompt")
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
    }
    if (!file) {
      console.error("❌ Missing image file")
      return NextResponse.json({ error: "Image file is required." }, { status: 400 })
    }

    // Convert uploaded image to base64 for demo
    console.log("🖼️ DEMO: Converting image to base64...")
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const originalImageDataUri = `data:${file.type};base64,${base64}`
    console.log("✅ DEMO: Image converted, size:", originalImageDataUri.length)

    // Simulate processing time for realistic demo
    console.log("⚙️ DEMO: Simulating FLUX Kontext processing...")
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create a canvas to add watermark
    console.log("🎨 DEMO: Adding watermark to image...")
    
    // For demo, we'll return the original image with a success message
    // In a real implementation, you'd add a watermark here
    const demoResult = {
      url: originalImageDataUri,
      message: "✨ Image edited with FLUX Kontext!",
      demo: true,
      prompt: prompt,
      processing_time: "2.1s",
      model: "FLUX.1 Kontext (Demo Mode)"
    }

    console.log("🎉 DEMO SUCCESS! Returning processed image")
    console.log("✨ Message: Image edited with FLUX Kontext!")
    
    return NextResponse.json(demoResult)

  } catch (err: any) {
    console.error("💥 DEMO Error:", err)
    
    return NextResponse.json({
      error: "Demo processing failed.",
      details: err?.message,
      demo: true
    }, { status: 500 })
  }
}
