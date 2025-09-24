// FAL AI Integration Types

export interface ProcessingParams {
  strength: number      // 0-1, default 0.75
  guidance: number      // 0-10, default 3.5
  seed?: number        // Optional seed for reproducible results
}

export interface ProcessedImageResult {
  url: string
  originalUrl?: string
  processingTime: number
  parameters: ProcessingParams
  error?: string
}

export interface ImageVersion {
  id: string
  url: string
  type: 'original' | 'processed'
  timestamp: Date
  prompt?: string
  parameters?: ProcessingParams
  processingTime?: number
  filename: string
}

export interface ProcessingState {
  isProcessing: boolean
  progress?: number
  stage?: 'uploading' | 'processing' | 'downloading'
  error?: string
  startTime?: Date
  estimatedTime?: number
}

export interface AppState {
  currentImage: string | null
  originalImage: string | null
  processedImage: string | null
  versions: ImageVersion[]
  processingState: ProcessingState
  processingParams: ProcessingParams
  showComparison: boolean
}

// Enhanced Component Props
export interface EnhancedImageCanvasProps {
  currentImage: string | null
  setCurrentImage: (image: string | null) => void
  isProcessing: boolean
  processedImage?: string | null
  originalImage?: string | null
  onDownload?: () => void
  showComparison?: boolean
  onToggleComparison?: () => void
}

export interface EnhancedAIPromptInterfaceProps {
  onProcess: (processing: boolean) => void
  currentImage: string | null
  onSubmitPrompt: (prompt: string, params: ProcessingParams) => Promise<void>
  processingParams: ProcessingParams
  onParamsChange: (params: ProcessingParams) => void
  processingState: ProcessingState
}

export interface EnhancedVersionHistoryProps {
  versions: ImageVersion[]
  currentVersionId?: string
  onVersionSelect: (version: ImageVersion) => void
  onVersionDelete?: (versionId: string) => void
}

// Service Interfaces
export interface FALService {
  processImage(
    imageFile: File,
    prompt: string,
    params: ProcessingParams
  ): Promise<ProcessedImageResult>
  
  uploadImage(file: File): Promise<string>
  downloadImage(url: string, filename: string): void
  validateParameters(params: ProcessingParams): boolean
  compressImage(file: File, quality?: number): Promise<File>
}

// API Response Types
export interface FALAPIResponse {
  url: string
  raw?: any
  error?: string
}

export interface FALAPIError {
  error: string
  details?: string
  code?: string
}

// Utility Types
export type ProcessingStage = 'uploading' | 'processing' | 'downloading'
export type ImageType = 'original' | 'processed'
export type ComparisonMode = 'side-by-side' | 'overlay' | 'toggle'

// Default Values
export const DEFAULT_PROCESSING_PARAMS: ProcessingParams = {
  strength: 0.75,
  guidance: 3.5
}

export const DEFAULT_PROCESSING_STATE: ProcessingState = {
  isProcessing: false
}

export const DEFAULT_APP_STATE: Omit<AppState, 'processingParams' | 'processingState'> = {
  currentImage: null,
  originalImage: null,
  processedImage: null,
  versions: [],
  showComparison: false
}