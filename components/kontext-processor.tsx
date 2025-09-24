"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"

type ProcessState = "idle" | "loading" | "done" | "error"

export default function KontextProcessor() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [prompt, setPrompt] = React.useState("")
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [state, setState] = React.useState<ProcessState>("idle")
  const [error, setError] = React.useState<string | null>(null)

  // Optional tunables with sensible defaults
  const [strength, setStrength] = React.useState<number>(0.75)
  const [guidance, setGuidance] = React.useState<number>(3.5)

  React.useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function onProcess() {
    setError(null)
    setResultUrl(null)
    if (!file || !prompt.trim()) {
      setError("Please add an image and a prompt before processing.")
      return
    }
    setState("loading")
    try {
      const fd = new FormData()
      fd.append("prompt", prompt.trim())
      fd.append("image", file)
      fd.append("strength", String(strength))
      fd.append("guidance", String(guidance))

      const res = await fetch("/api/kontext", {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Unknown error")
      }
      setResultUrl(data.url)
      setState("done")
    } catch (e: any) {
      setError(e?.message || "Failed to process image.")
      setState("error")
    }
  }

  function onDownload() {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "fluxedit-kontext.jpg"
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <section className="w-full" aria-labelledby="kontext-title">
      <div
        className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md p-4 md:p-6"
        // subtle glassmorphism via tokens + blur; no hard-coded colors
      >
        <header className="mb-4 md:mb-6">
          <h2 id="kontext-title" className="text-lg md:text-xl font-semibold text-pretty">
            FLUX Kontext
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe your change in natural language and let FluxEdit transform your image.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Upload + Preview */}
          <Card className="p-4 bg-card/50 backdrop-blur-md border-border/60">
            <label htmlFor="kontext-image" className="block text-sm font-medium mb-2">
              Image
            </label>
            <div className="flex items-center gap-3">
              <input
                id="kontext-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setFile(f ?? null)
                }}
                className="block w-full cursor-pointer text-sm file:me-4 file:rounded-lg file:border file:bg-secondary file:px-3 file:py-2 file:text-foreground file:hover:bg-secondary/80"
              />
              {file ? (
                <Button variant="secondary" onClick={() => setFile(null)}>
                  Remove
                </Button>
              ) : null}
            </div>
            {preview ? (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Uploaded preview"
                  className="w-full h-auto rounded-xl border border-border/60"
                />
              </div>
            ) : null}
          </Card>

          {/* Prompt + Controls */}
          <Card className="p-4 bg-card/50 backdrop-blur-md border-border/60">
            <label htmlFor="kontext-prompt" className="block text-sm font-medium mb-2">
              Prompt
            </label>
            <textarea
              id="kontext-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Example: Replace the background with a sunset city skyline, keep subject sharp."
              className="w-full rounded-lg border border-border/60 bg-background/70 p-3 outline-none"
            />

            <div className="mt-4 grid gap-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Strength</span>
                  <span className="font-medium">{strength.toFixed(2)}</span>
                </div>
                <Slider
                  value={[strength]}
                  step={0.01}
                  min={0}
                  max={1}
                  onValueChange={(v) => setStrength(v[0] ?? 0.75)}
                  aria-label="Strength"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Guidance</span>
                  <span className="font-medium">{guidance.toFixed(1)}</span>
                </div>
                <Slider
                  value={[guidance]}
                  step={0.1}
                  min={0}
                  max={10}
                  onValueChange={(v) => setGuidance(v[0] ?? 3.5)}
                  aria-label="Guidance"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={onProcess} disabled={!file || !prompt.trim()}>
                Process with Kontext
              </Button>
              {error ? <span className="text-sm text-destructive">{error}</span> : null}
            </div>
          </Card>
        </div>

        {/* Result */}
        {resultUrl ? (
          <div className="mt-6">
            <h3 className="text-base font-medium mb-3">Result</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultUrl || "/placeholder.svg"}
              alt="Kontext result"
              className="w-full h-auto rounded-xl border border-border/60"
            />
            <div className="mt-3">
              <Button variant="secondary" onClick={onDownload}>
                Download result
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Loading Dialog */}
      <Dialog open={state === "loading"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border border-border/60 bg-card/60 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Processing image</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Progress value={undefined} className="w-full" />
            <p className="mt-2 text-sm text-muted-foreground">This usually takes a few seconds...</p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
