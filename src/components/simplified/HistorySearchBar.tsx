"use client"

/**
 * HistorySearchBar — prominent full-width search input for the History screen.
 *
 * Features:
 * - Full-text search across transactions (debounced 150ms)
 * - Match count display
 * - Clear button
 * - Search suggestions dropdown (recent searches + quick filters) when focused
 *   but empty
 * - Highlight matching text in results via HighlightText export
 *
 * Requirements: 22.1
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/primitives/Input'
import { FONT_FAMILY, spacing, typography, fontWeights } from '@/styles/typography'
import { fills, shadows } from '@/styles/shared'
import { radius } from '@/styles/surfaces'
import { springs, useReducedMotion } from '@/lib/animations'
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  QUICK_FILTERS,
} from '@/lib/transactionSearch'
import type { QuickFilter } from '@/lib/transactionSearch'

// ============================================================================
// Types
// ============================================================================

export interface HistorySearchBarProps {
  /** Current search query (controlled) */
  value: string
  /** Called on debounced query change */
  onChange: (query: string) => void
  /** Number of matching results to display */
  resultCount?: number
  /** Total transactions (to show "X of Y") */
  totalCount?: number
  /** Called when a quick filter is applied */
  onQuickFilter?: (filter: QuickFilter) => void
}

// ============================================================================
// HighlightText — exported for use in TransactionList
// ============================================================================

export function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const parts: { text: string; highlighted: boolean }[] = []

  let lastIndex = 0
  let index = lowerText.indexOf(lowerQuery)

  while (index !== -1) {
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), highlighted: false })
    }
    parts.push({ text: text.slice(index, index + query.length), highlighted: true })
    lastIndex = index + query.length
    index = lowerText.indexOf(lowerQuery, lastIndex)
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlighted: false })
  }

  return (
    <>
      {parts.map((part, i) =>
        part.highlighted ? (
          <mark
            key={i}
            style={{
              background: 'var(--accent-300)',
              borderRadius: 3,
              padding: '0 2px',
              color: 'inherit',
            }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}

// ============================================================================
// HistorySearchBar Component
// ============================================================================

export function HistorySearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
  onQuickFilter,
}: HistorySearchBarProps) {
  const { prefersReducedMotion } = useReducedMotion()
  const motionTransition = prefersReducedMotion ? { duration: 0 } : springs.snappy
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const liveRegionId = useId()

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Load recent searches when focused
  useEffect(() => {
    if (isFocused) {
      setRecentSearches(getRecentSearches())
    }
  }, [isFocused])

  // Debounced onChange (150ms)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value
      setLocalValue(newVal)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onChange(newVal)
        if (newVal.trim()) {
          addRecentSearch(newVal.trim())
        }
      }, 150)
    },
    [onChange]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleClear = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    setLocalValue('')
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  const handleRecentClick = useCallback(
    (query: string) => {
      setLocalValue(query)
      onChange(query)
      setIsFocused(false)
      inputRef.current?.blur()
    },
    [onChange]
  )

  const handleQuickFilterClick = useCallback(
    (filter: QuickFilter) => {
      if (onQuickFilter) {
        onQuickFilter(filter)
      } else {
        // Fallback: use as a text search query
        setLocalValue(filter.query)
        onChange(filter.query)
      }
      setIsFocused(false)
      inputRef.current?.blur()
    },
    [onChange, onQuickFilter]
  )

  const handleClearRecent = useCallback(() => {
    clearRecentSearches()
    setRecentSearches([])
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showDropdown = isFocused && !localValue.trim()
  const hasResults = resultCount !== undefined && localValue.trim()

  // Build screen reader announcement for result count changes
  const liveAnnouncement = hasResults
    ? `${resultCount} result${resultCount !== 1 ? 's' : ''} found${totalCount !== undefined ? ` out of ${totalCount}` : ''}`
    : ''

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Live region for announcing result count to screen readers */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {liveAnnouncement}
      </div>

      {/* Search input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          width: '100%',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Icon
            name="action:search"
            size={18}
            color="var(--sub)"
            strokeWidth={2}
            aria-hidden
            style={{
              position: 'absolute',
              insetInlineStart: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          />
          <Input
            inputRef={inputRef}
            variant="search"
            type="search"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-label="Search transaction merchant or note"
            placeholder="Search merchant or note"
            value={localValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
          />
        </div>

        {/* Match count */}
        {hasResults && (
          <span
            style={{
              fontSize: typography['body-sm'].fontSize,
              fontFamily: FONT_FAMILY,
              fontWeight: fontWeights.medium,
              color: 'var(--sub)',
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {resultCount}{totalCount !== undefined ? ` of ${totalCount}` : ''}
          </span>
        )}

        {/* Clear button */}
        {localValue && (
          <motion.button
            type="button"
            onClick={handleClear}
            whileTap={{ scale: 0.95 }}
            transition={motionTransition}
            aria-label="Clear search"
            className="focus-ring interactive-control"
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface-recessed)',
              border: 'var(--border-default)',
              borderRadius: radius.control,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon name="action:close" size={16} color="var(--text)" strokeWidth={2.5} />
          </motion.button>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showDropdown && (recentSearches.length > 0 || QUICK_FILTERS.length > 0) && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              background: 'var(--surface)',
              border: `1px solid ${fills[8]}`,
              borderRadius: radius.control,
              padding: '12px 0',
              zIndex: 50,
              boxShadow: shadows.lg,
            }}
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div style={{ padding: '0 14px', marginBottom: spacing.sm }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: spacing.xs,
                  }}
                >
                  <span
                    style={{
                      fontSize: typography.caption.fontSize,
                      fontFamily: FONT_FAMILY,
                      fontWeight: fontWeights.semibold,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Recent
                  </span>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    aria-label="Clear recent searches"
                    className="focus-ring interactive-control"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px 6px',
                      fontSize: typography.caption.fontSize,
                      fontFamily: FONT_FAMILY,
                      fontWeight: fontWeights.medium,
                      color: 'var(--sub)',
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => handleRecentClick(search)}
                      className="focus-ring interactive-control"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                        padding: '8px 8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: radius.control,
                        cursor: 'pointer',
                        textAlign: "start",
                        width: '100%',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = fills[4]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <Icon name="action:history" size={14} color="var(--muted)" strokeWidth={2} />
                      <span
                        style={{
                          fontSize: typography['body-sm'].fontSize,
                          fontFamily: FONT_FAMILY,
                          color: 'var(--text)',
                          fontWeight: fontWeights.regular,
                        }}
                      >
                        {search}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick filters */}
            <div style={{ padding: '0 14px' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: typography.caption.fontSize,
                  fontFamily: FONT_FAMILY,
                  fontWeight: fontWeights.semibold,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: spacing.xs,
                }}
              >
                Quick filters
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                {QUICK_FILTERS.map((filter) => (
                  <motion.button
                    key={filter.label}
                    type="button"
                    onClick={() => handleQuickFilterClick(filter)}
                    whileTap={{ scale: 0.95 }}
                    transition={motionTransition}
                    className="focus-ring interactive-control"
                    style={{
                      padding: '7px 14px',
                      fontSize: typography['body-sm'].fontSize,
                      fontFamily: FONT_FAMILY,
                      fontWeight: fontWeights.medium,
                      color: 'var(--text)',
                      background: fills[6],
                      border: `1px solid ${fills[10]}`,
                      borderRadius: radius.full,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
