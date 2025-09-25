"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AnimatedButton } from '@/components/ui/animated-button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Crown, ArrowRight } from 'lucide-react'

interface AuthGateProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  feature?: string
}

export function AuthGate({ isOpen, onClose, onSuccess, feature = "AI image processing" }: AuthGateProps) {
  const { signInWithGoogle, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGoogle()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Unlock AI Magic ✨
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to unlock {feature} and save your creations
            </p>
            
            <div className="grid gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm">Unlimited AI image processing</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm">Save and organize your projects</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <ArrowRight className="h-5 w-5 text-primary" />
                <span className="text-sm">Access version history</span>
              </div>
            </div>
          </div>

          <AnimatedButton
            onClick={handleSignIn}
            disabled={isSigningIn || loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
            size="lg"
          >
            {isSigningIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </AnimatedButton>

          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              Free • No credit card required
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}