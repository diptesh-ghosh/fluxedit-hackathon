"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, User, Crown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const { user, isAuthenticated, signInWithGoogle, signOut, loading } = useAuth()

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut()
    } else {
      await signInWithGoogle()
    }
  }

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
        {/* HACKATHON MODE: Show demo badge and optional auth */}
        <Badge variant="default" className="text-xs bg-gradient-to-r from-purple-500 to-blue-500">
          <Sparkles className="w-3 h-3 mr-1" />
          Hackathon Demo
        </Badge>
        
        {!isAuthenticated ? (
          <AnimatedButton 
            variant="outline" 
            size="sm" 
            onClick={handleAuthAction}
            disabled={loading}
          >
            Optional Sign In
          </AnimatedButton>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-muted">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <AnimatedButton 
              variant="outline" 
              size="sm" 
              onClick={handleAuthAction}
              disabled={loading}
            >
              Sign Out
            </AnimatedButton>
          </div>
        )}
      </div>
    </header>
  )
}
