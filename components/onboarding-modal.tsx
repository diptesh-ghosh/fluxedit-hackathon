"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Upload, Wand2, History } from "lucide-react"

interface OnboardingModalProps {
  onClose: () => void
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Welcome to FluxEdit",
      description: "The revolutionary AI-powered photo editor that understands natural language commands.",
    },
    {
      icon: <Upload className="w-8 h-8 text-primary" />,
      title: "Upload Your Image",
      description: "Drag and drop any image to get started. We support JPG, PNG, and WebP formats.",
    },
    {
      icon: <Wand2 className="w-8 h-8 text-primary" />,
      title: "Use AI Commands",
      description:
        "Simply describe what you want to do: 'remove background', 'enhance colors', or any creative edit you can imagine.",
    },
    {
      icon: <History className="w-8 h-8 text-primary" />,
      title: "Track Your Progress",
      description: "Every edit is automatically saved. Switch between versions anytime with our version history.",
    },
  ]

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">Getting Started</DialogTitle>
          <Progress value={progress} className="w-full mt-2" />
        </DialogHeader>

        <div className="text-center py-6">
          <div className="mb-4 flex justify-center">{currentStep.icon}</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{currentStep.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <AnimatedButton onClick={() => setStep(step + 1)} variant="gradient">
                Next
              </AnimatedButton>
            ) : (
              <AnimatedButton onClick={onClose} variant="gradient">
                Get Started
              </AnimatedButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
