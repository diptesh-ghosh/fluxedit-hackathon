"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Timeline } from "@/components/ui/timeline"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Clock, ImageIcon, Sparkles, Trash2, Download } from "lucide-react"
import { EnhancedVersionHistoryProps, ImageVersion } from "@/types/fal-integration"
import { formatProcessingTime } from "@/services/fal-service"

interface VersionHistoryProps extends EnhancedVersionHistoryProps {
  // Maintain backward compatibility
}

export function VersionHistory({ 
  versions = [], 
  currentVersionId, 
  onVersionSelect,
  onVersionDelete 
}: VersionHistoryProps) {
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`
    return timestamp.toLocaleDateString()
  }

  const getVersionIcon = (version: ImageVersion) => {
    return version.type === 'processed' ? (
      <Sparkles className="w-3 h-3 text-primary" />
    ) : (
      <ImageIcon className="w-3 h-3 text-muted-foreground" />
    )
  }

  const getVersionName = (version: ImageVersion) => {
    if (version.type === 'original') return 'Original'
    return version.prompt || 'AI Enhanced'
  }

  const timelineItems = versions.map((version, index) => ({
    id: version.id,
    title: getVersionName(version),
    description: version.type === 'processed' && version.processingTime 
      ? `Processed in ${formatProcessingTime(version.processingTime)}`
      : `Version ${index + 1}`,
    timestamp: formatTimestamp(version.timestamp),
    status: version.id === currentVersionId ? ("current" as const) : ("completed" as const),
    icon: getVersionIcon(version),
  }))

  const handleDownloadVersion = (version: ImageVersion, event: React.MouseEvent) => {
    event.stopPropagation()
    
    const link = document.createElement('a')
    link.href = version.url
    link.download = version.filename
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteVersion = (versionId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (onVersionDelete) {
      onVersionDelete(versionId)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-foreground">Version History</h2>
        {versions.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {versions.length}
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 max-h-[calc(100vh-200px)]">
        {versions.length > 0 ? (
          <>
            <Timeline items={timelineItems} />

            <div className="space-y-3 mt-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`glass rounded-lg p-3 hover:bg-card/60 transition-all duration-200 cursor-pointer group ${
                    version.id === currentVersionId ? 'ring-2 ring-primary/50' : ''
                  }`}
                  onClick={() => onVersionSelect(version)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img
                        src={version.url || "/placeholder.svg"}
                        alt={getVersionName(version)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">
                          {getVersionName(version)}
                        </p>
                        {version.type === 'processed' && (
                          <Sparkles className="w-3 h-3 text-primary" />
                        )}
                        {version.id === currentVersionId && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(version.timestamp)}
                      </p>
                      {version.type === 'processed' && version.parameters && (
                        <p className="text-xs text-muted-foreground">
                          Strength: {version.parameters.strength.toFixed(2)}, 
                          Guidance: {version.parameters.guidance.toFixed(1)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDownloadVersion(version, e)}
                        title="Download this version"
                      >
                        <Download className="w-3 h-3" />
                      </AnimatedButton>
                      {version.type === 'processed' && onVersionDelete && (
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteVersion(version.id, e)}
                          title="Delete this version"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">No versions yet</p>
            <p className="text-xs text-muted-foreground">
              Upload an image to start creating versions
            </p>
          </div>
        )}
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          {versions.length > 0 ? 'Auto-save enabled' : 'Versions will appear here'}
        </p>
      </div>
    </div>
  )
}
