"use client"

import { useState, useEffect, useCallback } from 'react'
import { ProcessingParams } from '@/types/fal-integration'

interface UseDebouncedParamsOptions {
  delay?: number
  onParamsChange?: (params: ProcessingParams) => void
}

export function useDebouncedParams(
  initialParams: ProcessingParams,
  options: UseDebouncedParamsOptions = {}
) {
  const { delay = 300, onParamsChange } = options
  
  const [params, setParams] = useState(initialParams)
  const [debouncedParams, setDebouncedParams] = useState(initialParams)

  // Debounce parameter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams(params)
      onParamsChange?.(params)
    }, delay)

    return () => clearTimeout(timer)
  }, [params, delay, onParamsChange])

  const updateParams = useCallback((newParams: ProcessingParams) => {
    setParams(newParams)
  }, [])

  const updateParam = useCallback(<K extends keyof ProcessingParams>(
    key: K,
    value: ProcessingParams[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    params,
    debouncedParams,
    updateParams,
    updateParam,
    isDebouncing: JSON.stringify(params) !== JSON.stringify(debouncedParams)
  }
}