// Accessibility utilities for FAL integration

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management
export class FocusManager {
  private focusStack: HTMLElement[] = []

  pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus) {
      this.focusStack.push(currentFocus)
    }
    element.focus()
  }

  popFocus(): void {
    const previousFocus = this.focusStack.pop()
    if (previousFocus) {
      previousFocus.focus()
    }
  }

  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Focus first element
    firstElement?.focus()

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}

export const focusManager = new FocusManager()

// Keyboard navigation helpers
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void
): void {
  let newIndex = currentIndex

  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      event.preventDefault()
      break
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      event.preventDefault()
      break
    case 'Home':
      newIndex = 0
      event.preventDefault()
      break
    case 'End':
      newIndex = items.length - 1
      event.preventDefault()
      break
  }

  if (newIndex !== currentIndex) {
    onIndexChange(newIndex)
    items[newIndex]?.focus()
  }
}

// Alt text generation for processed images
export function generateAltText(
  prompt: string,
  isProcessed: boolean = false,
  processingTime?: number
): string {
  if (!isProcessed) {
    return 'Original uploaded image'
  }

  const baseText = `AI processed image: ${prompt}`
  
  if (processingTime) {
    const seconds = Math.round(processingTime / 1000)
    return `${baseText} (processed in ${seconds} seconds)`
  }

  return baseText
}

// High contrast detection
export function detectHighContrastMode(): boolean {
  // Create a test element to detect high contrast mode
  const testElement = document.createElement('div')
  testElement.style.cssText = `
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    background-color: rgb(31, 41, 59);
    border: 1px solid rgb(255, 255, 255);
  `
  
  document.body.appendChild(testElement)
  
  const computedStyle = window.getComputedStyle(testElement)
  const isHighContrast = computedStyle.backgroundColor !== 'rgb(31, 41, 59)' ||
                        computedStyle.borderColor !== 'rgb(255, 255, 255)'
  
  document.body.removeChild(testElement)
  
  return isHighContrast
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

export function meetsWCAGContrast(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(color1, color2)
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

// Accessible loading states
export function createAccessibleLoadingState(
  message: string,
  progress?: number
): { ariaLabel: string; ariaValueNow?: number; ariaValueText?: string } {
  let ariaLabel = message
  let ariaValueNow: number | undefined
  let ariaValueText: string | undefined

  if (progress !== undefined) {
    ariaValueNow = Math.round(progress)
    ariaValueText = `${ariaValueNow}% complete`
    ariaLabel = `${message}, ${ariaValueText}`
  }

  return { ariaLabel, ariaValueNow, ariaValueText }
}

// Error message accessibility
export function createAccessibleErrorMessage(
  error: string,
  canRetry: boolean = false
): { message: string; role: string; ariaLive: string } {
  const message = canRetry 
    ? `Error: ${error}. You can try again.`
    : `Error: ${error}`

  return {
    message,
    role: 'alert',
    ariaLive: 'assertive'
  }
}

// Keyboard shortcuts manager
export class KeyboardShortcuts {
  private shortcuts = new Map<string, () => void>()
  private isEnabled = true

  register(key: string, callback: () => void, description?: string): void {
    this.shortcuts.set(key.toLowerCase(), callback)
  }

  unregister(key: string): void {
    this.shortcuts.delete(key.toLowerCase())
  }

  enable(): void {
    this.isEnabled = true
  }

  disable(): void {
    this.isEnabled = false
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isEnabled) return

    const key = this.getKeyString(event)
    const callback = this.shortcuts.get(key)

    if (callback) {
      event.preventDefault()
      callback()
    }
  }

  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = []
    
    if (event.ctrlKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    if (event.metaKey) parts.push('meta')
    
    parts.push(event.key.toLowerCase())
    
    return parts.join('+')
  }

  getShortcuts(): Array<{ key: string; description?: string }> {
    return Array.from(this.shortcuts.keys()).map(key => ({ key }))
  }
}

export const keyboardShortcuts = new KeyboardShortcuts()

// Browser compatibility checks
export function checkBrowserCompatibility(): {
  webp: boolean
  fileApi: boolean
  dragDrop: boolean
  canvas: boolean
  backDropFilter: boolean
} {
  const canvas = document.createElement('canvas')
  
  return {
    webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    fileApi: !!(window.File && window.FileReader && window.FileList && window.Blob),
    dragDrop: 'draggable' in document.createElement('div'),
    canvas: !!(canvas.getContext && canvas.getContext('2d')),
    backDropFilter: CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
  }
}

// Fallback handlers for unsupported features
export function createFallbackHandlers() {
  const compatibility = checkBrowserCompatibility()

  return {
    // WebP fallback
    getImageFormat: (): string => {
      return compatibility.webp ? 'image/webp' : 'image/jpeg'
    },

    // File API fallback
    handleFileUpload: (callback: (file: File) => void) => {
      if (compatibility.fileApi) {
        return callback
      }
      
      return () => {
        announceToScreenReader('File upload not supported in this browser', 'assertive')
      }
    },

    // Drag and drop fallback
    createUploadHandler: (onFile: (file: File) => void) => {
      if (compatibility.dragDrop) {
        return {
          onDrop: (e: DragEvent) => {
            e.preventDefault()
            const files = e.dataTransfer?.files
            if (files && files[0]) {
              onFile(files[0])
            }
          },
          onDragOver: (e: DragEvent) => e.preventDefault()
        }
      }

      return {
        onDrop: () => {},
        onDragOver: () => {}
      }
    },

    // Backdrop filter fallback
    getGlassmorphismStyles: (): React.CSSProperties => {
      if (compatibility.backDropFilter) {
        return {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }
      }

      return {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }
    }
  }
}

// Accessibility testing helpers (for development)
export function runAccessibilityChecks(element: HTMLElement): string[] {
  const issues: string[] = []

  // Check for missing alt text on images
  const images = element.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.alt) {
      issues.push(`Image ${index + 1} missing alt text`)
    }
  })

  // Check for buttons without accessible names
  const buttons = element.querySelectorAll('button')
  buttons.forEach((button, index) => {
    const hasText = button.textContent?.trim()
    const hasAriaLabel = button.getAttribute('aria-label')
    const hasAriaLabelledBy = button.getAttribute('aria-labelledby')
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push(`Button ${index + 1} missing accessible name`)
    }
  })

  // Check for form inputs without labels
  const inputs = element.querySelectorAll('input, textarea, select')
  inputs.forEach((input, index) => {
    const hasLabel = element.querySelector(`label[for="${input.id}"]`)
    const hasAriaLabel = input.getAttribute('aria-label')
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push(`Input ${index + 1} missing label`)
    }
  })

  return issues
}