"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Sparkles, User } from "lucide-react"

export function Header() {
  return (
    <header className="h-16 glass-strong border-b border-border/50 px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">FluxEdit</h1>
          <p className="text-xs text-muted-foreground">AI Photo Editor</p>
        </div>
      </div>

      {/* User Profile & Auth */}
      <div className="flex items-center gap-4">
        <AnimatedButton variant="outline" size="sm" className="glass border-border/50 bg-transparent">
          Sign in with Google
        </AnimatedButton>
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-muted">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
