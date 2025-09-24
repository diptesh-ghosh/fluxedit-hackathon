// Image processing utilities for quality preservation and format handling

export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  quality?: number
}

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: string
  maintainAspectRatio?: boolean
}

// Get image metadata
export function getImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: file.type,
        size: file.size
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image metadata'))
    }

    img.src = url
  })
}

// Smart compression that preserves quality
export function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.9,
    format = file.type,
    maintainAspectRatio = true
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions
      if (maintainAspectRatio) {
        const aspectRatio = width / height

        if (width > maxWidth) {
          width = maxWidth
          height = width / aspectRatio
        }

        if (height > maxHeight) {
          height = maxHeight
          width = height * aspectRatio
        }
      } else {
        width = Math.min(width, maxWidth)
        height = Math.min(height, maxHeight)
      }

      canvas.width = width
      canvas.height = height

      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob with specified quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        format,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image for compression'))
    img.src = URL.createObjectURL(file)
  })
}

// Convert image format
export function convertImageFormat(
  file: File, 
  targetFormat: string, 
  quality: number = 0.9
): Promise<File> {
  return compressImage(file, { 
    format: targetFormat, 
    quality,
    maxWidth: 4096, // Higher limit for format conversion
    maxHeight: 4096 
  })
}

// Optimize image for web display
export function optimizeForWeb(file: File): Promise<File> {
  return getImageMetadata(file).then(metadata => {
    // Determine optimal settings based on image characteristics
    let quality = 0.85
    let maxDimension = 1920

    // Higher quality for smaller images
    if (metadata.size < 1024 * 1024) { // < 1MB
      quality = 0.9
    }

    // Reduce quality for very large images
    if (metadata.size > 5 * 1024 * 1024) { // > 5MB
      quality = 0.75
      maxDimension = 1600
    }

    // Use WebP for better compression if supported
    const targetFormat = supportsWebP() ? 'image/webp' : 'image/jpeg'

    return compressImage(file, {
      maxWidth: maxDimension,
      maxHeight: maxDimension,
      quality,
      format: targetFormat
    })
  })
}

// Check WebP support
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

// Generate thumbnail
export function generateThumbnail(
  file: File, 
  size: number = 150
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      const { width, height } = img
      const aspectRatio = width / height

      let thumbWidth = size
      let thumbHeight = size

      if (aspectRatio > 1) {
        thumbHeight = size / aspectRatio
      } else {
        thumbWidth = size * aspectRatio
      }

      canvas.width = thumbWidth
      canvas.height = thumbHeight

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight)

      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    img.onerror = () => reject(new Error('Failed to generate thumbnail'))
    img.src = URL.createObjectURL(file)
  })
}

// Progressive loading placeholder
export function generateBlurPlaceholder(
  file: File, 
  size: number = 20
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      canvas.width = size
      canvas.height = size

      // Disable smoothing for pixelated effect
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, size, size)

      // Apply blur effect
      ctx.filter = 'blur(2px)'
      ctx.drawImage(canvas, 0, 0)

      resolve(canvas.toDataURL('image/jpeg', 0.5))
    }

    img.onerror = () => reject(new Error('Failed to generate placeholder'))
    img.src = URL.createObjectURL(file)
  })
}

// Validate image dimensions
export function validateImageDimensions(
  metadata: ImageMetadata,
  minWidth: number = 100,
  minHeight: number = 100,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): boolean {
  return (
    metadata.width >= minWidth &&
    metadata.height >= minHeight &&
    metadata.width <= maxWidth &&
    metadata.height <= maxHeight
  )
}

// Calculate optimal compression settings
export function getOptimalCompressionSettings(
  metadata: ImageMetadata
): CompressionOptions {
  const { width, height, size } = metadata
  const megapixels = (width * height) / 1000000

  let quality = 0.9
  let maxDimension = 2048

  // Adjust based on file size
  if (size > 8 * 1024 * 1024) { // > 8MB
    quality = 0.7
    maxDimension = 1600
  } else if (size > 4 * 1024 * 1024) { // > 4MB
    quality = 0.8
    maxDimension = 1800
  }

  // Adjust based on resolution
  if (megapixels > 12) { // > 12MP
    maxDimension = Math.min(maxDimension, 1920)
  }

  return {
    quality,
    maxWidth: maxDimension,
    maxHeight: maxDimension,
    maintainAspectRatio: true
  }
}

// Cache management for processed images
class ImageCache {
  private cache = new Map<string, string>()
  private maxSize = 50 // Maximum number of cached images

  set(key: string, dataUrl: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, dataUrl)
  }

  get(key: string): string | undefined {
    return this.cache.get(key)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  generateKey(file: File, options: CompressionOptions): string {
    return `${file.name}-${file.size}-${file.lastModified}-${JSON.stringify(options)}`
  }
}

export const imageCache = new ImageCache()

// Cached compression
export async function compressImageCached(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const cacheKey = imageCache.generateKey(file, options)
  
  if (imageCache.has(cacheKey)) {
    const cachedDataUrl = imageCache.get(cacheKey)!
    const response = await fetch(cachedDataUrl)
    const blob = await response.blob()
    return new File([blob], file.name, { type: options.format || file.type })
  }

  const compressedFile = await compressImage(file, options)
  const dataUrl = URL.createObjectURL(compressedFile)
  imageCache.set(cacheKey, dataUrl)
  
  return compressedFile
}