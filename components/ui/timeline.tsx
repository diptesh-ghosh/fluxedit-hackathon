"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp: string
  status?: "completed" | "current" | "pending"
  icon?: React.ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex items-start group">
          {/* Timeline line */}
          {index !== items.length - 1 && (
            <div className="absolute left-4 top-8 w-0.5 h-full bg-border group-hover:bg-primary/50 transition-colors duration-200" />
          )}

          {/* Timeline dot */}
          <div
            className={cn(
              "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
              item.status === "completed" && "bg-primary border-primary text-primary-foreground",
              item.status === "current" && "bg-primary/20 border-primary text-primary animate-pulse",
              item.status === "pending" && "bg-background border-border text-muted-foreground",
              !item.status && "bg-background border-border text-muted-foreground",
            )}
          >
            {item.icon || (
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  item.status === "completed" && "bg-primary-foreground",
                  item.status === "current" && "bg-primary",
                  item.status === "pending" && "bg-muted-foreground",
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="ml-4 pb-8 flex-1">
            <div className="flex items-center justify-between">
              <h3
                className={cn(
                  "font-medium transition-colors duration-200",
                  item.status === "current" && "text-primary",
                )}
              >
                {item.title}
              </h3>
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            </div>
            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
