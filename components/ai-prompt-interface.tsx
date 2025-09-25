"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Slider } from "@/components/ui/slider"
import { Sparkles, Wand2, RotateCcw, AlertCircle } from "lucide-react"
// HACKATHON MODE: Lock icon not needed
// import { Lock } from "lucide-react"
import { EnhancedAIPromptInterfaceProps, DEFAULT_PROCESSING_PARAMS } from "@/types/fal-integration"
import { useAuth } from "@/contexts/auth-context"

interface AIPromptInterfaceProps extends EnhancedAIPromptInterfaceProps {
  // Maintain backward compatibility
}

interface PresetCommand {
  label: string
  prompt: string
  params?: Partial<ProcessingParams>
  description?: string
}

const presetCommands: PresetCommand[] = [
  {
    label: "Remove background",
    prompt: "Remove the background completely, keep the main subject sharp and detailed",
    params: { strength: 0.8, guidance: 4.0 }
  },
  {
    label: "Enhance colors",
    prompt: "Enhance colors and lighting, make the image more vibrant and professional",
    params: { strength: 0.6, guidance: 3.0 }
  },
  {
    label: "Portrait retouch",
    prompt: "Apply professional portrait retouching, smooth skin, enhance eyes, natural look",
    params: { strength: 0.5, guidance: 3.5 }
  },
  {
    label: "Oil painting",
    prompt: "Transform to oil painting style, artistic brushstrokes, rich colors",
    params: { strength: 0.9, guidance: 4.5 }
  },
  {
    label: "Sunset beach",
    prompt: "Change background to sunset beach scene, warm golden lighting, keep subject natural",
    params: { strength: 0.7, guidance: 4.0 }
  },
  {
    label: "Studio lighting",
    prompt: "Add dramatic studio lighting, professional photography look, soft shadows",
    params: { strength: 0.6, guidance: 3.5 }
  },
  {
    label: "Black & white",
    prompt: "Convert to black and white, high contrast, dramatic shadows and highlights",
    params: { strength: 0.7, guidance: 3.0 }
  },
  {
    label: "Vintage film",
    prompt: "Add vintage film effect, warm tones, slight grain, nostalgic atmosphere",
    params: { strength: 0.6, guidance: 3.5 }
  }
]

export function AIPromptInterface({ 
  onProcess, 
  currentImage,
  onSubmitPrompt,
  processingParams = DEFAULT_PROCESSING_PARAMS,
  onParamsChange,
  processingState
}: AIPromptInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { isAuthenticated } = useAuth()

  const isProcessing = processingState?.isProcessing || false
  const processingError = processingState?.error

  const handleProcess = async () => {
    if (!prompt.trim() || !currentImage || !onSubmitPrompt) return

    try {
      await onSubmitPrompt(prompt.trim(), processingParams)
      setPrompt("")
    } catch (error) {
      console.error('Processing failed:', error)
    }
  }

  const handleRetry = () => {
    if (processingError) {
      handleProcess()
    }
  }

  const resetParameters = () => {
    if (onParamsChange) {
      onParamsChange(DEFAULT_PROCESSING_PARAMS)
    }
  }

  const handlePresetClick = (preset: PresetCommand) => {
    setPrompt(preset.prompt)
    
    // Apply preset-specific parameters if available
    if (preset.params && onParamsChange) {
      const updatedParams = { ...processingParams, ...preset.params }
      onParamsChange(updatedParams)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-foreground">AI Commands</h2>
      </div>

      {/* Preset Commands */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Quick Actions</h3>
        <ScrollArea className="h-32">
          <div className="flex flex-wrap gap-2">
            {presetCommands.map((preset) => (
              <Badge
                key={preset.label}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs relative group"
                onClick={() => handlePresetClick(preset)}
                title={preset.description || preset.prompt}
              >
                {preset.label}
                {preset.params && (
                  <span className="ml-1 text-xs opacity-60">
                    ⚙️
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Advanced Parameters */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">Parameters</h3>
          <div className="flex items-center gap-2">
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={resetParameters}
              title="Reset to defaults"
            >
              <RotateCcw className="w-3 h-3" />
            </AnimatedButton>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-3 bg-muted/10 rounded-lg border border-border/30">
            {/* Strength Parameter */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Strength</span>
                <span className="font-medium">{processingParams.strength.toFixed(2)}</span>
              </div>
              <Slider
                value={[processingParams.strength]}
                step={0.01}
                min={0}
                max={1}
                onValueChange={(value) => onParamsChange?.({ ...processingParams, strength: value[0] })}
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How much the AI should change the image (0 = minimal, 1 = maximum)
              </p>
            </div>

            {/* Guidance Parameter */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Guidance</span>
                <span className="font-medium">{processingParams.guidance.toFixed(1)}</span>
              </div>
              <Slider
                value={[processingParams.guidance]}
                step={0.1}
                min={0}
                max={10}
                onValueChange={(value) => onParamsChange?.({ ...processingParams, guidance: value[0] })}
                disabled={isProcessing}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How closely the AI should follow your prompt (0 = loose, 10 = strict)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-foreground mb-2">Custom Command</h3>
        <Textarea
          placeholder="Describe what you want to do with your image..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 resize-none bg-input border-border/50 focus:border-primary"
          disabled={isProcessing}
          aria-label="AI processing prompt"
          aria-describedby="prompt-help"
        />

        {/* Error Display */}
        {processingError && (
          <div 
            className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm text-destructive">{processingError}</p>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-2 text-xs"
                  aria-label="Retry AI processing"
                >
                  Try Again
                </AnimatedButton>
              </div>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && processingState?.stage && (
          <div 
            className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              ></div>
              <span className="text-sm text-primary capitalize">
                {processingState.stage}...
              </span>
              {processingState.estimatedTime && (
                <span className="text-xs text-muted-foreground">
                  (~{Math.round(processingState.estimatedTime / 1000)}s)
                </span>
              )}
            </div>
          </div>
        )}

        <AnimatedButton
          variant="gradient"
          onClick={handleProcess}
          disabled={!prompt.trim() || !currentImage || isProcessing}
          className="mt-4"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Apply AI Edit
            </>
          )}
        </AnimatedButton>

        {/* HACKATHON MODE: Show demo notice instead of auth requirement */}
        <div className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary text-center">
            ✨ DEMO MODE: FLUX Kontext AI Active - Instant Processing!
          </p>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground" id="prompt-help">
          💡 Try natural language like "make the sky more dramatic" or "remove the person in the background"
        </p>
      </div>
    </div>
  )
}
