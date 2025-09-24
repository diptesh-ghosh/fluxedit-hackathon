import { 
  ProcessingParams, 
  ProcessedImageResult, 
  FALService as IFALService,
  DEFAULT_PROCESSING_PARAMS 
} from '@/types/fal-integration'
import { 
  classifyError, 
  validateImageFile, 
  validatePrompt, 
  validateProcessingParams,
  estimateProcessingTime,
  getComplexityFromPrompt,
  reportError
} from '@/utils/error-handling'
import { 
  requestDeduplicator, 
  performanceMonitor, 
  memoryManager 
} from '@/utils/performance'

export class FALService implements IFALService {
  private readonly API_ENDPOINT = '/api/kontext'
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
  private readonly PROCESSING_TIMEOUT = 30000 // 30 seconds

  async processImage(
    imageFile: File,
    prompt: string,
    params: ProcessingParams = DEFAULT_PROCESSING_PARAMS
  ): Promise<ProcessedImageResult> {
    // Create deduplication key
    const dedupeKey = `${imageFile.name}-${imageFile.size}-${prompt}-${JSON.stringify(params)}`
    
    return requestDeduplicator.deduplicate(dedupeKey, async () => {
      const endTiming = performanceMonitor.startTiming('fal-processing')
      
      try {
        // Validate inputs using centralized validation
        validateImageFile(imageFile)
        validatePrompt(prompt)
        validateProcessingParams(params)

        // Optimize image before processing
        const optimizeEndTiming = performanceMonitor.startTiming('image-optimization')
        const optimizedImage = await this.compressImage(imageFile, 0.9)
        optimizeEndTiming()

        // Prepare form data
        const formData = new FormData()
        formData.append('image', optimizedImage)
        formData.append('prompt', prompt.trim())
        formData.append('strength', params.strength.toString())
        formData.append('guidance', params.guidance.toString())
        
        if (params.seed !== undefined) {
          formData.append('seed', params.seed.toString())
        }

        // Make API request with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.PROCESSING_TIMEOUT)

        const apiEndTiming = performanceMonitor.startTiming('api-request')
        const response = await fetch(this.API_ENDPOINT, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })
        apiEndTiming()

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        const processingTime = endTiming()

        if (!result.url) {
          throw new Error('No image URL returned from processing')
        }

        return {
          url: result.url,
          processingTime,
          parameters: params
        }

      } catch (error) {
        const processingTime = endTiming()
        const classifiedError = classifyError(error)
        
        // Report error for debugging
        reportError(classifiedError, {
          processingTime,
          imageSize: imageFile.size,
          promptLength: prompt.length,
          params
        })
        
        throw classifiedError
      }
    })
  }

  async uploadImage(file: File): Promise<string> {
    validateImageFile(file)
    
    const endTiming = performanceMonitor.startTiming('image-upload')
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        endTiming()
        resolve(reader.result as string)
      }
      reader.onerror = () => {
        endTiming()
        reject(new Error('Failed to read image file'))
      }
      reader.readAsDataURL(file)
    })
  }

  downloadImage(url: string, filename: string): void {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.rel = 'noopener'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      throw new Error('Failed to download image')
    }
  }

  validateParameters(params: ProcessingParams): boolean {
    validateProcessingParams(params)
    return true
  }

  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    const { compressImageCached, getImageMetadata, getOptimalCompressionSettings } = await import('@/utils/image-processing')
    
    try {
      const metadata = await getImageMetadata(file)
      const optimalSettings = getOptimalCompressionSettings(metadata)
      
      // Use provided quality or optimal quality
      const compressionOptions = {
        ...optimalSettings,
        quality: quality !== 0.8 ? quality : optimalSettings.quality
      }
      
      return await compressImageCached(file, compressionOptions)
    } catch (error) {
      // Fallback to original file if compression fails
      console.warn('Image compression failed, using original:', error)
      return file
    }
  }

  // Removed private validation methods - now using centralized validation
}

// Utility functions
export const generateFilename = (originalName: string, prompt: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const promptSlug = prompt.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30)
  
  const extension = originalName.split('.').pop() || 'jpg'
  return `fluxedit-${promptSlug}-${timestamp}.${extension}`
}

export const formatProcessingTime = (milliseconds: number): string => {
  const seconds = Math.round(milliseconds / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export const createImageVersion = (
  url: string,
  type: 'original' | 'processed',
  filename: string,
  prompt?: string,
  parameters?: ProcessingParams,
  processingTime?: number
) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  url,
  type,
  timestamp: new Date(),
  filename,
  prompt,
  parameters,
  processingTime
})

// Singleton instance
export const falService = new FALService()