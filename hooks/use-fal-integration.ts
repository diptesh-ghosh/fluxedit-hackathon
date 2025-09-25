"use client"

import { useState, useCallback, useEffect } from 'react'
import { 
  AppState, 
  ProcessingParams, 
  ProcessingState, 
  ImageVersion,
  DEFAULT_PROCESSING_PARAMS,
  DEFAULT_PROCESSING_STATE 
} from '@/types/fal-integration'
import { falService, createImageVersion, generateFilename } from '@/services/fal-service'
import { 
  classifyError, 
  getUserFriendlyMessage, 
  shouldRetry, 
  getRetryDelay,
  estimateProcessingTime,
  getComplexityFromPrompt 
} from '@/utils/error-handling'
import { 
  compressedStorage, 
  createCleanupManager, 
  preloadImage 
} from '@/utils/performance'
import { useAuth } from '@/contexts/auth-context'

const STORAGE_KEY = 'fal-integration-state'

export function useFALIntegration() {
  // Auth context
  const { isAuthenticated } = useAuth()
  
  // Core state
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [versions, setVersions] = useState<ImageVersion[]>([])
  const [processingState, setProcessingState] = useState<ProcessingState>(DEFAULT_PROCESSING_STATE)
  const [processingParams, setProcessingParams] = useState<ProcessingParams>(DEFAULT_PROCESSING_PARAMS)
  const [showComparison, setShowComparison] = useState(false)
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>()
  const [showAuthGate, setShowAuthGate] = useState(false)

  // Load state from compressed storage on mount
  useEffect(() => {
    try {
      const saved = compressedStorage.getItem(STORAGE_KEY)
      if (saved) {
        if (saved.processingParams) {
          setProcessingParams(saved.processingParams)
        }
        if (saved.versions) {
          const loadedVersions = saved.versions.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp)
          }))
          setVersions(loadedVersions)
          
          // Preload recent images for better performance
          const recentUrls = loadedVersions
            .slice(-3) // Last 3 versions
            .map((v: ImageVersion) => v.url)
          
          preloadImage(recentUrls[0]).catch(() => {}) // Preload most recent
        }
      }
    } catch (error) {
      console.warn('Failed to load saved state:', error)
    }
  }, [])

  // Save state to compressed storage with debouncing
  const saveState = useCallback(() => {
    try {
      const stateToSave = {
        processingParams,
        versions: versions.map(v => ({
          ...v,
          timestamp: v.timestamp.toISOString()
        }))
      }
      compressedStorage.setItem(STORAGE_KEY, stateToSave)
    } catch (error) {
      console.warn('Failed to save state:', error)
    }
  }, [processingParams, versions])

  // Save state when it changes
  useEffect(() => {
    saveState()
  }, [saveState])

  // Handle image upload (can accept File or string for backward compatibility)
  const handleImageUpload = useCallback(async (fileOrUrl: File | string | null) => {
    if (!fileOrUrl) {
      setCurrentImage(null)
      setOriginalImage(null)
      setProcessedImage(null)
      setVersions([])
      setCurrentVersionId(undefined)
      setShowComparison(false)
      return
    }

    try {
      let imageUrl: string
      let filename: string

      if (typeof fileOrUrl === 'string') {
        // Handle data URL or regular URL
        imageUrl = fileOrUrl
        filename = 'uploaded-image.jpg'
      } else {
        // Handle File object
        imageUrl = await falService.uploadImage(fileOrUrl)
        filename = fileOrUrl.name
      }
      
      // Create original version
      const originalVersion = createImageVersion(
        imageUrl,
        'original',
        filename
      )

      setCurrentImage(imageUrl)
      setOriginalImage(imageUrl)
      setProcessedImage(null)
      setVersions([originalVersion])
      setCurrentVersionId(originalVersion.id)
      setShowComparison(false)

    } catch (error) {
      const classifiedError = classifyError(error)
      const userMessage = getUserFriendlyMessage(classifiedError)
      
      setProcessingState({
        ...DEFAULT_PROCESSING_STATE,
        error: userMessage
      })
    }
  }, [])

  // Handle prompt submission with retry logic
  const handleSubmitPrompt = useCallback(async (prompt: string, params: ProcessingParams, retryCount = 0) => {
    if (!currentImage) {
      throw new Error('No image selected')
    }

    // HACKATHON MODE: Skip authentication check - allow all users to process images
    // if (!isAuthenticated) {
    //   setShowAuthGate(true)
    //   return
    // }

    try {
      // Convert data URL to File for processing
      const response = await fetch(currentImage)
      const blob = await response.blob()
      const file = new File([blob], 'current-image.jpg', { type: 'image/jpeg' })

      // Estimate processing time
      const complexity = getComplexityFromPrompt(prompt)
      const estimatedTime = estimateProcessingTime(file.size, complexity)

      setProcessingState({
        isProcessing: true,
        stage: 'uploading',
        startTime: new Date(),
        estimatedTime,
        error: undefined
      })

      setProcessingState(prev => ({ ...prev, stage: 'processing' }))

      const result = await falService.processImage(file, prompt, params)

      // Create processed version
      const processedVersion = createImageVersion(
        result.url,
        'processed',
        generateFilename('processed-image', prompt),
        prompt,
        params,
        result.processingTime
      )

      setProcessedImage(result.url)
      setCurrentImage(result.url)
      setVersions(prev => [...prev, processedVersion])
      setCurrentVersionId(processedVersion.id)
      setProcessingState(DEFAULT_PROCESSING_STATE)

    } catch (error) {
      const classifiedError = classifyError(error)
      const userMessage = getUserFriendlyMessage(classifiedError)

      // Retry logic for retryable errors
      if (shouldRetry(classifiedError, retryCount)) {
        const delay = getRetryDelay(retryCount)
        
        setProcessingState(prev => ({
          ...prev,
          stage: 'uploading',
          error: `${userMessage} Retrying in ${delay / 1000}s...`
        }))

        setTimeout(() => {
          handleSubmitPrompt(prompt, params, retryCount + 1)
        }, delay)
        
        return
      }

      // Final error state
      setProcessingState({
        ...DEFAULT_PROCESSING_STATE,
        error: userMessage
      })
      
      throw classifiedError
    }
  }, [currentImage, isAuthenticated])

  // Handle version selection
  const handleVersionSelect = useCallback((version: ImageVersion) => {
    setCurrentImage(version.url)
    setCurrentVersionId(version.id)
    
    if (version.type === 'original') {
      setProcessedImage(null)
      setShowComparison(false)
    } else {
      setProcessedImage(version.url)
    }
  }, [])

  // Handle version deletion
  const handleVersionDelete = useCallback((versionId: string) => {
    setVersions(prev => {
      const filtered = prev.filter(v => v.id !== versionId)
      
      // If we deleted the current version, switch to the most recent one
      if (versionId === currentVersionId && filtered.length > 0) {
        const mostRecent = filtered[filtered.length - 1]
        setCurrentImage(mostRecent.url)
        setCurrentVersionId(mostRecent.id)
        
        if (mostRecent.type === 'original') {
          setProcessedImage(null)
          setShowComparison(false)
        } else {
          setProcessedImage(mostRecent.url)
        }
      }
      
      return filtered
    })
  }, [currentVersionId])

  // Handle parameter changes
  const handleParamsChange = useCallback((params: ProcessingParams) => {
    setProcessingParams(params)
  }, [])

  // Handle comparison toggle
  const handleToggleComparison = useCallback(() => {
    setShowComparison(prev => !prev)
  }, [])

  // Handle download
  const handleDownload = useCallback(() => {
    if (processedImage || currentImage) {
      const imageUrl = processedImage || currentImage!
      const currentVersion = versions.find(v => v.id === currentVersionId)
      const filename = currentVersion?.filename || generateFilename('image', 'download')
      
      falService.downloadImage(imageUrl, filename)
    }
  }, [processedImage, currentImage, versions, currentVersionId])

  // Clear all data
  const clearAll = useCallback(() => {
    setCurrentImage(null)
    setOriginalImage(null)
    setProcessedImage(null)
    setVersions([])
    setCurrentVersionId(undefined)
    setProcessingState(DEFAULT_PROCESSING_STATE)
    setShowComparison(false)
    compressedStorage.removeItem(STORAGE_KEY)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = createCleanupManager()
    
    return () => {
      cleanup.cleanup()
    }
  }, [])

  return {
    // State
    currentImage,
    originalImage,
    processedImage,
    versions,
    processingState,
    processingParams,
    showComparison,
    currentVersionId,

    // Actions
    handleImageUpload,
    handleSubmitPrompt,
    handleVersionSelect,
    handleVersionDelete,
    handleParamsChange,
    handleToggleComparison,
    handleDownload,
    clearAll,

    // Auth gate
    showAuthGate,
    setShowAuthGate,

    // Computed values
    hasProcessedImage: Boolean(processedImage),
    canShowComparison: Boolean(originalImage && processedImage),
    isProcessing: processingState.isProcessing,
    requiresAuth: !isAuthenticated
  }
}