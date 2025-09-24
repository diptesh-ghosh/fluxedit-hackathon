"use client"

import { AnimatedButton } from "@/components/ui/animated-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Undo2, Redo2, Save, Share2 } from "lucide-react"

export function FloatingToolbar() {
  return (
    <GlassCard className="fixed bottom-6 left-1/2 transform -translate-x-1/2 p-2 flex items-center gap-2 z-50">
      <AnimatedButton variant="ghost" size="sm">
        <Undo2 className="w-4 h-4" />
      </AnimatedButton>
      <AnimatedButton variant="ghost" size="sm">
        <Redo2 className="w-4 h-4" />
      </AnimatedButton>
      <div className="w-px h-6 bg-border/50 mx-1" />
      <AnimatedButton variant="ghost" size="sm">
        <Save className="w-4 h-4" />
      </AnimatedButton>
      <AnimatedButton variant="gradient" size="sm">
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </AnimatedButton>
    </GlassCard>
  )
}
