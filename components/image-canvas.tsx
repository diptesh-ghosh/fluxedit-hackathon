"use client"

import { useCallback, useState } from "react"
import { ZoomIn, ZoomOut, RotateCw, Download, Eye, EyeOff } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { ImageUpload } from "@/components/ui/image-upload"
import { EnhancedImageCanvasProps } from "@/types/fal-integration"
import { generateFilename } from "@/services/fal-service"

interface ImageCanvasProps extends EnhancedImageCanvasProps {
  // Maintain backward compatibility
}

export function ImageCanvas({ 
  currentImage, 
  setCurrentImage, 
  isProcessing,
  processedImage,
  originalImage,
  onDownload,
  showComparison = false,
  onToggleComparison
}: ImageCanvasProps) {
  const [zoom, setZoom] = useState(100)

  const handleImageSelect = useCallback(
    (file: File) => {
      // The hook now handles File objects directly
      setCurrentImage(file as any)
    },
    [setCurrentImage],
  )

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload()
    } else if (processedImage || currentImage) {
      const imageUrl = processedImage || currentImage!
      const filename = generateFilename('processed-image', 'ai-edit')
      
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = filename
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [onDownload, processedImage, currentImage])

  const displayImage = showComparison && originalImage ? originalImage : (processedImage || currentImage)
  const hasProcessedImage = Boolean(processedImage)
  const canShowComparison = Boolean(originalImage && processedImage)

  if (!currentImage) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Canvas</h2>
        </div>

        <div className="flex-1">
          <ImageUpload onImageSelect={handleImageSelect} className="h-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">Canvas</h2>
          {hasProcessedImage && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              AI Enhanced
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AnimatedButton variant="outline" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
            <ZoomOut className="w-4 h-4" />
          </AnimatedButton>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
          <AnimatedButton variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
            <ZoomIn className="w-4 h-4" />
          </AnimatedButton>
          <AnimatedButton variant="outline" size="sm">
            <RotateCw className="w-4 h-4" />
          </AnimatedButton>
          {canShowComparison && onToggleComparison && (
            <AnimatedButton 
              variant={showComparison ? "default" : "outline"} 
              size="sm" 
              onClick={onToggleComparison}
              title={showComparison ? "Show processed image" : "Show original image"}
            >
              {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </AnimatedButton>
          )}
          <AnimatedButton 
            variant="gradient" 
            size="sm" 
            onClick={handleDownload}
            disabled={!currentImage}
            title="Download current image"
          >
            <Download className="w-4 h-4" />
          </AnimatedButton>
        </div>
      </div>

      {/* Image Display */}
      <div className="flex-1 bg-muted/20 rounded-lg overflow-hidden relative">
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative transition-transform duration-200" style={{ transform: `scale(${zoom / 100})` }}>
            {canShowComparison && showComparison ? (
              // Before/After Comparison View
              <div className="relative">
                <img
                  src={originalImage || "/placeholder.svg"}
                  alt="Original image before AI processing"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  role="img"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  Original
                </div>
              </div>
            ) : (
              // Current Image View
              <div className="relative">
                <img
                  src={displayImage || "/placeholder.svg"}
                  alt={hasProcessedImage ? "AI processed image" : "Current edit"}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  role="img"
                  aria-describedby={isProcessing ? "processing-status" : undefined}
                />
                {hasProcessedImage && !showComparison && (
                  <div className="absolute top-2 left-2 bg-primary/80 text-white px-2 py-1 rounded text-xs">
                    AI Enhanced
                  </div>
                )}
              </div>
            )}
            
            {isProcessing && (
              <div 
                className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
                role="status"
                aria-live="polite"
                id="processing-status"
              >
                <div className="text-center">
                  <div 
                    className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"
                    aria-hidden="true"
                  ></div>
                  <p className="text-sm text-white">AI Processing...</p>
                  <p className="text-xs text-white/70 mt-1">This may take a few moments</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
