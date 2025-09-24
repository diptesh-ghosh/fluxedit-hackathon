// Error handling utilities for FAL integration

export class FALError extends Error {
  constructor(
    message: string,
    public code?: string,
    public retryable: boolean = false,
    public details?: any
  ) {
    super(message)
    this.name = 'FALError'
  }
}

export class NetworkError extends FALError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', true)
  }
}

export class ValidationError extends FALError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', false, { field })
  }
}

export class ProcessingError extends FALError {
  constructor(message: string, retryable: boolean = true) {
    super(message, 'PROCESSING_ERROR', retryable)
  }
}

export class ConfigurationError extends FALError {
  constructor(message: string = 'Service configuration error') {
    super(message, 'CONFIG_ERROR', false)
  }
}

export class TimeoutError extends FALError {
  constructor(message: string = 'Request timed out') {
    super(message, 'TIMEOUT_ERROR', true)
  }
}

// Error classification and handling
export function classifyError(error: unknown): FALError {
  if (error instanceof FALError) {
    return error
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return new NetworkError(error.message)
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('aborted')) {
      return new TimeoutError(error.message)
    }

    // Configuration errors
    if (message.includes('fal_key') || message.includes('environment') || message.includes('config')) {
      return new ConfigurationError(error.message)
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return new ValidationError(error.message)
    }

    // Processing errors
    if (message.includes('processing') || message.includes('api') || message.includes('server')) {
      return new ProcessingError(error.message)
    }

    // Generic error
    return new FALError(error.message, 'UNKNOWN_ERROR', false)
  }

  return new FALError('An unknown error occurred', 'UNKNOWN_ERROR', false)
}

// User-friendly error messages
export function getUserFriendlyMessage(error: FALError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Connection failed. Please check your internet connection and try again.'
    
    case 'TIMEOUT_ERROR':
      return 'The request took too long. Please try again with a smaller image or simpler prompt.'
    
    case 'CONFIG_ERROR':
      return 'Service configuration error. Please contact support if this persists.'
    
    case 'VALIDATION_ERROR':
      return error.message // Validation messages are already user-friendly
    
    case 'PROCESSING_ERROR':
      return 'Image processing failed. Please try again or use different parameters.'
    
    default:
      return error.message || 'Something went wrong. Please try again.'
  }
}

// Retry logic
export function shouldRetry(error: FALError, attemptCount: number): boolean {
  const maxRetries = 3
  return error.retryable && attemptCount < maxRetries
}

export function getRetryDelay(attemptCount: number): number {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(1000 * Math.pow(2, attemptCount), 4000)
}

// Progress estimation
export function estimateProcessingTime(imageSize: number, complexity: string): number {
  // Base time in milliseconds
  let baseTime = 10000 // 10 seconds

  // Adjust for image size (rough estimate)
  const sizeMB = imageSize / (1024 * 1024)
  if (sizeMB > 5) baseTime += 5000
  if (sizeMB > 8) baseTime += 5000

  // Adjust for prompt complexity
  const complexityMultiplier = {
    simple: 1,
    medium: 1.3,
    complex: 1.6
  }[complexity] || 1.2

  return Math.round(baseTime * complexityMultiplier)
}

export function getComplexityFromPrompt(prompt: string): string {
  const words = prompt.toLowerCase().split(' ')
  const complexKeywords = [
    'detailed', 'intricate', 'complex', 'artistic', 'professional',
    'dramatic', 'cinematic', 'photorealistic', 'high-quality'
  ]
  
  const simpleKeywords = [
    'simple', 'basic', 'clean', 'minimal', 'quick'
  ]

  const complexCount = words.filter(word => 
    complexKeywords.some(keyword => word.includes(keyword))
  ).length

  const simpleCount = words.filter(word => 
    simpleKeywords.some(keyword => word.includes(keyword))
  ).length

  if (complexCount > simpleCount && complexCount > 1) return 'complex'
  if (simpleCount > 0) return 'simple'
  if (words.length > 15) return 'complex'
  if (words.length < 5) return 'simple'
  
  return 'medium'
}

// Error reporting (for analytics/debugging)
export function reportError(error: FALError, context: Record<string, any> = {}) {
  // In a real app, you might send this to an error tracking service
  console.error('FAL Integration Error:', {
    message: error.message,
    code: error.code,
    retryable: error.retryable,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  })
}

// Validation helpers
export function validateImageFile(file: File): void {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!file) {
    throw new ValidationError('Please select an image file')
  }

  if (file.size > maxSize) {
    throw new ValidationError(`Image too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
  }

  if (!supportedTypes.includes(file.type)) {
    throw new ValidationError(`Unsupported format. Please use: ${supportedTypes.join(', ')}`)
  }
}

export function validatePrompt(prompt: string): void {
  if (!prompt || !prompt.trim()) {
    throw new ValidationError('Please enter a description of what you want to do')
  }

  if (prompt.trim().length < 3) {
    throw new ValidationError('Description must be at least 3 characters long')
  }

  if (prompt.trim().length > 1000) {
    throw new ValidationError('Description must be less than 1000 characters')
  }

  // Check for potentially problematic content
  const problematicWords = ['nsfw', 'explicit', 'violence', 'illegal']
  const lowerPrompt = prompt.toLowerCase()
  
  for (const word of problematicWords) {
    if (lowerPrompt.includes(word)) {
      throw new ValidationError('Please use appropriate content descriptions')
    }
  }
}

export function validateProcessingParams(params: any): void {
  if (typeof params.strength !== 'number' || params.strength < 0 || params.strength > 1) {
    throw new ValidationError('Strength must be between 0 and 1')
  }

  if (typeof params.guidance !== 'number' || params.guidance < 0 || params.guidance > 10) {
    throw new ValidationError('Guidance must be between 0 and 10')
  }

  if (params.seed !== undefined && (!Number.isInteger(params.seed) || params.seed < 0)) {
    throw new ValidationError('Seed must be a positive integer')
  }
}