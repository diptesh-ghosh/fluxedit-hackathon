"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ImageIcon, Zap, Shield, Sparkles } from "lucide-react"

interface ImageQualityIndicatorProps {
  size: number // File size in bytes
  width?: number
  height?: number
  format?: string
  compressed?: boolean
  processed?: boolean
  className?: string
}

export function ImageQualityIndicator({
  size,
  width,
  height,
  format,
  compressed = false,
  processed = false,
  className
}: ImageQualityIndicatorProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const getQualityLevel = (sizeInMB: number): 'high' | 'medium' | 'low' => {
    if (sizeInMB > 3) return 'high'
    if (sizeInMB > 1) return 'medium'
    return 'low'
  }

  const sizeInMB = size / (1024 * 1024)
  const qualityLevel = getQualityLevel(sizeInMB)
  const megapixels = width && height ? ((width * height) / 1000000).toFixed(1) : null

  const getQualityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="text-xs">
              <ImageIcon className="w-3 h-3 mr-1" />
              {formatSize(size)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p>File size: {formatSize(size)}</p>
              {width && height && (
                <>
                  <p>Dimensions: {width} × {height}</p>
                  {megapixels && <p>Resolution: {megapixels}MP</p>}
                </>
              )}
              {format && <p>Format: {format.replace('image/', '').toUpperCase()}</p>}
            </div>
          </TooltipContent>
        </Tooltip>

        {width && height && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={`text-xs ${getQualityColor(qualityLevel)}`}>
                {qualityLevel.toUpperCase()}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Image quality based on resolution and file size</p>
            </TooltipContent>
          </Tooltip>
        )}

        {compressed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs text-blue-600 bg-blue-100">
                <Zap className="w-3 h-3 mr-1" />
                Optimized
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Image has been optimized for processing</p>
            </TooltipContent>
          </Tooltip>
        )}

        {processed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs text-purple-600 bg-purple-100">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Image has been processed with AI</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}