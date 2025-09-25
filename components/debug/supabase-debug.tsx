"use client"

import { useState } from 'react'
import { AnimatedButton } from '@/components/ui/animated-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getSupabaseBrowser } from '@/lib/supabase/client'

export function SupabaseDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const testConnection = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult(`Connection failed: ${error.message}`)
      } else {
        setTestResult('Connection successful!')
      }
    } catch (err) {
      setTestResult(`Test failed: ${err}`)
    }
  }

  const testGoogleAuth = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setTestResult(`Google auth failed: ${error.message}`)
      } else {
        setTestResult('Google auth initiated (check for redirect)')
      }
    } catch (err) {
      setTestResult(`Google auth test failed: ${err}`)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatedButton
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
        >
          Debug Supabase
        </AnimatedButton>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 bg-card/95 backdrop-blur-xl border border-border/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Supabase Debug</h3>
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ✕
          </AnimatedButton>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Environment Variables:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={supabaseUrl ? "default" : "destructive"}>
                  SUPABASE_URL
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {supabaseUrl ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={supabaseAnonKey ? "default" : "destructive"}>
                  ANON_KEY
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {supabaseAnonKey ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={testConnection}
              className="w-full"
            >
              Test Connection
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={testGoogleAuth}
              className="w-full"
            >
              Test Google Auth
            </AnimatedButton>
          </div>

          {testResult && (
            <div className="p-2 bg-muted rounded text-xs">
              {testResult}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Current URL: {window.location.origin}</p>
            <p>Callback: {window.location.origin}/auth/callback</p>
          </div>
        </div>
      </Card>
    </div>
  )
}