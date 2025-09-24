"use client"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedButton } from "./animated-button"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove?: () => void
  currentImage?: string | null
  className?: string
  accept?: Record<string, string[]>
  maxSize?: number
  disabled?: boolean
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  currentImage,
  className,
  accept = { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        onImageSelect(file)
      }
    },
    [onImageSelect],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  })

  const hasError = fileRejections.length > 0

  if (currentImage) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative overflow-hidden rounded-xl">
          <img src={currentImage || "/placeholder.svg"} alt="Uploaded image" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            {onImageRemove && (
              <AnimatedButton
                variant="destructive"
                size="sm"
                onClick={onImageRemove}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </AnimatedButton>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10 scale-105",
          hasError && "border-destructive bg-destructive/5",
          disabled && "opacity-50 cursor-not-allowed",
          "backdrop-blur-sm bg-white/5",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200",
              isDragActive ? "bg-primary/20" : "bg-muted/20",
            )}
          >
            {isDragActive ? (
              <Upload className="w-8 h-8 text-primary animate-bounce" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{isDragActive ? "Drop your image here" : "Upload an image"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop or click to select • JPG, PNG, WebP up to 10MB
            </p>

            {hasError && <p className="text-sm text-destructive mb-4">{fileRejections[0]?.errors[0]?.message}</p>}

            <AnimatedButton variant="gradient" disabled={disabled}>
              Choose Image
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  )
}
