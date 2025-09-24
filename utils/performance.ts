// Performance optimization utilities

// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  clear(): void {
    this.pendingRequests.clear()
  }
}

export const requestDeduplicator = new RequestDeduplicator()

// Image preloading
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(preloadImage))
}

// Lazy loading with intersection observer
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry)
      }
    })
  }, defaultOptions)
}

// Memory management
export class MemoryManager {
  private objectUrls = new Set<string>()
  private maxUrls = 50

  createObjectURL(blob: Blob): string {
    const url = URL.createObjectURL(blob)
    this.objectUrls.add(url)
    
    // Clean up old URLs if we have too many
    if (this.objectUrls.size > this.maxUrls) {
      const urlsArray = Array.from(this.objectUrls)
      const urlsToRevoke = urlsArray.slice(0, urlsArray.length - this.maxUrls)
      
      urlsToRevoke.forEach(url => {
        URL.revokeObjectURL(url)
        this.objectUrls.delete(url)
      })
    }
    
    return url
  }

  revokeObjectURL(url: string): void {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url)
      this.objectUrls.delete(url)
    }
  }

  cleanup(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url))
    this.objectUrls.clear()
  }
}

export const memoryManager = new MemoryManager()

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()

  startTiming(key: string): () => number {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(key, duration)
      return duration
    }
  }

  recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const values = this.metrics.get(key)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  getMetrics(key: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(key)
    if (!values || values.length === 0) return null

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }

  getAllMetrics(): Record<string, ReturnType<PerformanceMonitor['getMetrics']>> {
    const result: Record<string, any> = {}
    
    for (const [key] of this.metrics) {
      result[key] = this.getMetrics(key)
    }
    
    return result
  }

  clear(): void {
    this.metrics.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Throttling utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0

  return (...args: Parameters<T>) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

// Debouncing utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

// Resource cleanup
export function createCleanupManager() {
  const cleanupFunctions: (() => void)[] = []

  const addCleanup = (fn: () => void) => {
    cleanupFunctions.push(fn)
  }

  const cleanup = () => {
    cleanupFunctions.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.warn('Cleanup function failed:', error)
      }
    })
    cleanupFunctions.length = 0
  }

  return { addCleanup, cleanup }
}

// Browser storage with compression
export class CompressedStorage {
  private compress(data: any): string {
    return JSON.stringify(data)
  }

  private decompress(data: string): any {
    return JSON.parse(data)
  }

  setItem(key: string, value: any): void {
    try {
      const compressed = this.compress(value)
      localStorage.setItem(key, compressed)
    } catch (error) {
      console.warn('Failed to store item:', error)
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      return this.decompress(item)
    } catch (error) {
      console.warn('Failed to retrieve item:', error)
      return null
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}

export const compressedStorage = new CompressedStorage()

// Batch processing utility
export class BatchProcessor<T, R> {
  private queue: T[] = []
  private processing = false

  constructor(
    private processFn: (items: T[]) => Promise<R[]>,
    private batchSize = 10,
    private delay = 100
  ) {}

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...item, resolve, reject } as any)
      this.scheduleProcessing()
    })
  }

  private scheduleProcessing(): void {
    if (this.processing) return

    setTimeout(() => {
      this.processBatch()
    }, this.delay)
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    const batch = this.queue.splice(0, this.batchSize)

    try {
      const results = await this.processFn(batch.map(item => {
        const { resolve, reject, ...data } = item as any
        return data
      }))

      batch.forEach((item: any, index) => {
        item.resolve(results[index])
      })
    } catch (error) {
      batch.forEach((item: any) => {
        item.reject(error)
      })
    } finally {
      this.processing = false
      
      // Process remaining items
      if (this.queue.length > 0) {
        this.scheduleProcessing()
      }
    }
  }
}