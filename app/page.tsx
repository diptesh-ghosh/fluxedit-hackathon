"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { VersionHistory } from "@/components/version-history"
import { ImageCanvas } from "@/components/image-canvas"
import { AIPromptInterface } from "@/components/ai-prompt-interface"
import { OnboardingModal } from "@/components/onboarding-modal"
import { FloatingToolbar } from "@/components/floating-toolbar"
import { AuthGate } from "@/components/auth/auth-gate"
import { SupabaseDebug } from "@/components/debug/supabase-debug"
import { GlassCard } from "@/components/ui/glass-card"
import { useFALIntegration } from "@/hooks/use-fal-integration"
import { keyboardShortcuts, checkBrowserCompatibility, announceToScreenReader } from "@/utils/accessibility"

export default function FluxEditApp() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Check for auth errors in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      setAuthError(decodeURIComponent(error))
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])
  
  // Use the FAL integration hook for centralized state management
  const {
    currentImage,
    originalImage,
    processedImage,
    versions,
    processingState,
    processingParams,
    showComparison,
    currentVersionId,
    handleImageUpload,
    handleSubmitPrompt,
    handleVersionSelect,
    handleVersionDelete,
    handleParamsChange,
    handleToggleComparison,
    handleDownload,
    hasProcessedImage,
    canShowComparison,
    isProcessing,
    showAuthGate,
    setShowAuthGate,
    requiresAuth
  } = useFALIntegration()

  // Set up keyboard shortcuts and accessibility features
  useEffect(() => {
    // Check browser compatibility
    const compatibility = checkBrowserCompatibility()
    
    if (!compatibility.fileApi) {
      announceToScreenReader('File upload may not work properly in this browser', 'assertive')
    }

    // Register keyboard shortcuts
    keyboardShortcuts.register('ctrl+u', () => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      fileInput?.click()
    })

    keyboardShortcuts.register('ctrl+d', () => {
      if (currentImage) {
        handleDownload()
        announceToScreenReader('Image download started', 'polite')
      }
    })

    keyboardShortcuts.register('ctrl+shift+c', () => {
      if (canShowComparison) {
        handleToggleComparison()
        announceToScreenReader(
          showComparison ? 'Showing processed image' : 'Showing original image',
          'polite'
        )
      }
    })

    // Add keyboard event listener
    document.addEventListener('keydown', keyboardShortcuts.handleKeyDown)

    return () => {
      document.removeEventListener('keydown', keyboardShortcuts.handleKeyDown)
    }
  }, [currentImage, canShowComparison, showComparison, handleDownload, handleToggleComparison])

  // Announce processing state changes
  useEffect(() => {
    if (isProcessing) {
      announceToScreenReader('AI processing started', 'polite')
    } else if (processingState.error) {
      announceToScreenReader(`Processing failed: ${processingState.error}`, 'assertive')
    } else if (hasProcessedImage) {
      announceToScreenReader('AI processing completed successfully', 'polite')
    }
  }, [isProcessing, processingState.error, hasProcessedImage])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Main Layout - Three Panel Design */}
      <main className="flex h-[calc(100vh-4rem)] gap-4 p-4">
        {/* Left Panel - Version History */}
        <GlassCard className="w-80 p-4 overflow-hidden">
          <VersionHistory 
            versions={versions}
            currentVersionId={currentVersionId}
            onVersionSelect={handleVersionSelect}
            onVersionDelete={handleVersionDelete}
          />
        </GlassCard>

        {/* Center Panel - Image Canvas */}
        <GlassCard className="flex-1 p-4 overflow-hidden">
          <ImageCanvas 
            currentImage={currentImage}
            setCurrentImage={handleImageUpload}
            isProcessing={isProcessing}
            processedImage={processedImage}
            originalImage={originalImage}
            onDownload={handleDownload}
            showComparison={showComparison}
            onToggleComparison={handleToggleComparison}
          />
        </GlassCard>

        {/* Right Panel - AI Prompt Interface */}
        <GlassCard className="w-80 p-4 overflow-hidden">
          <AIPromptInterface 
            onProcess={() => {}} // Legacy prop, not used with new integration
            currentImage={currentImage}
            onSubmitPrompt={handleSubmitPrompt}
            processingParams={processingParams}
            onParamsChange={handleParamsChange}
            processingState={processingState}
          />
        </GlassCard>
      </main>

      <FloatingToolbar />

      {/* Auth Gate Modal */}
      <AuthGate 
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        feature="AI image processing"
      />

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      {/* Auth Error Display */}
      {authError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-destructive">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Authentication Error</p>
                <p className="text-xs text-destructive/80 mt-1">{authError}</p>
                <button 
                  onClick={() => setAuthError(null)}
                  className="text-xs text-destructive/60 hover:text-destructive mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Component (remove in production) */}
      <SupabaseDebug />
    </div>
  )
}
