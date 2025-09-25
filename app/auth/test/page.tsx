"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AnimatedButton } from '@/components/ui/animated-button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AuthTestPage() {
  const { user, loading, signInWithGoogle, signOut, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setError(null)
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      await signOut()
    } catch (err: any) {
      setError(err.message || 'Sign out failed')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Authentication Test Page</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              <Badge variant={loading ? "default" : "secondary"}>
                {loading ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Authenticated:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>User:</span>
              <Badge variant={user ? "default" : "secondary"}>
                {user ? user.email || 'Logged in' : "None"}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>SUPABASE_URL:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>SUPABASE_ANON_KEY:</span>
              <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {!isAuthenticated ? (
              <AnimatedButton
                onClick={handleSignIn}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Loading..." : "Sign In with Google"}
              </AnimatedButton>
            ) : (
              <AnimatedButton
                onClick={handleSignOut}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </AnimatedButton>
            )}
          </div>
        </Card>

        {error && (
          <Card className="p-6 border-destructive">
            <h2 className="text-lg font-semibold mb-2 text-destructive">Error</h2>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {user && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Data</h2>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  )
}