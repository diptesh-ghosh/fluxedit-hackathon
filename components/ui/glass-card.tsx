"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-2xl",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-50",
        "relative overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
