/**
 * Hand-drawn illustrations for emotional moments.
 *
 * This system is intentionally separate from `Icon.tsx`: it is for category
 * selection, empty states, and goal milestones—not actions or controls.
 */

import { useId, type SVGProps } from 'react'

/** The canonical square coordinate system for every Folio illustration. */
export const ILLUSTRATION_ARTBOARD = 48
/** Smallest size at which the 2px monoline remains intentionally legible. */
export const ILLUSTRATION_MIN_SIZE = 32
/** Shared monoline weight from the creative direction. */
export const ILLUSTRATION_STROKE_WIDTH = 2

export type IllustrationName =
  | 'category:dining-hall'
  | 'category:eating-out'
  | 'category:textbooks'
  | 'category:rideshare-gas'
  | 'category:subscriptions'
  | 'category:rent-utilities'
  | 'category:entertainment'
  | 'category:personal-care'
  | 'category:miscellaneous'

export const ILLUSTRATION_LABELS: Record<IllustrationName, string> = {
  'category:dining-hall': 'Dining hall tray',
  'category:eating-out': 'Plate and fork',
  'category:textbooks': 'Stacked textbooks',
  'category:rideshare-gas': 'Car',
  'category:subscriptions': 'Subscription card',
  'category:rent-utilities': 'Home',
  'category:entertainment': 'Entertainment ticket',
  'category:personal-care': 'Personal care bottle',
  'category:miscellaneous': 'Miscellaneous parcel',
}

type IllustrationArt = () => JSX.Element

/**
 * One central covered tray, with an accent knob as its single focal fill.
 */
const DiningHall: IllustrationArt = () => (
  <>
    <path d="M9 34h30" />
    <path d="M13 33c1.4-9.2 6.7-15 11-15s9.6 5.8 11 15" />
    <circle cx="24" cy="15" r="1.75" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** One plate with a supporting fork and an intentionally spare accent centre. */
const EatingOut: IllustrationArt = () => (
  <>
    <circle cx="27" cy="25" r="12" />
    <circle cx="27" cy="25" r="7" />
    <path d="M13 13v24M10 13v7M13 13v7M16 13v7" />
    <circle cx="27" cy="25" r="2" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** Two books and one terracotta bookmark. */
const Textbooks: IllustrationArt = () => (
  <>
    <path d="M12 18h20v9H12z" />
    <path d="M16 28h20v9H16z" />
    <path d="M27 18v6l2-1.5 2 1.5v-6" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** A small car silhouette outlined with a single terracotta headlamp. */
const RideshareGas: IllustrationArt = () => (
  <>
    <path d="M10 30l3-9h22l3 9v6H10z" />
    <path d="M16 21l3-5h10l3 5" />
    <circle cx="16" cy="36" r="3" />
    <circle cx="32" cy="36" r="3" />
    <circle cx="34" cy="28" r="1.5" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** A single subscription card with one accent renewal mark. */
const Subscriptions: IllustrationArt = () => (
  <>
    <rect x="11" y="15" width="26" height="19" rx="3" />
    <path d="M11 21h26" />
    <circle cx="30" cy="28" r="2" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** A house outline with a small terracotta door as the focal fill. */
const RentUtilities: IllustrationArt = () => (
  <>
    <path d="M10 25L24 13l14 12v12H10z" />
    <path d="M19 37V28h10v9" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** A ticket, its single focal fill signalling the show without embedded text. */
const Entertainment: IllustrationArt = () => (
  <>
    <path d="M11 17h26v6a3 3 0 0 0 0 6v6H11v-6a3 3 0 0 0 0-6z" />
    <circle cx="24" cy="26" r="2.5" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** A pump bottle with one filled droplet on its label. */
const PersonalCare: IllustrationArt = () => (
  <>
    <path d="M18 18h12v4H18zM24 14v4M24 14h9" />
    <rect x="16" y="22" width="16" height="16" rx="3" />
    <circle cx="24" cy="30" r="2" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** A simple parcel with one accent shipping label. */
const Miscellaneous: IllustrationArt = () => (
  <>
    <path d="M13 19l11-6 11 6v16l-11 6-11-6z" />
    <path d="M13 19l11 6 11-6M24 25v16" />
    <rect x="20.5" y="28" width="7" height="4" rx="1" fill="var(--accent)" stroke="var(--accent)" />
  </>
)

/** Central, typed source of the category illustrations. */
export const ILLUSTRATION_REGISTRY: Record<IllustrationName, IllustrationArt> = {
  'category:dining-hall': DiningHall,
  'category:eating-out': EatingOut,
  'category:textbooks': Textbooks,
  'category:rideshare-gas': RideshareGas,
  'category:subscriptions': Subscriptions,
  'category:rent-utilities': RentUtilities,
  'category:entertainment': Entertainment,
  'category:personal-care': PersonalCare,
  'category:miscellaneous': Miscellaneous,
}

export interface IllustrationProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'height' | 'width' | 'viewBox' | 'aria-hidden' | 'aria-label' | 'aria-labelledby'> {
  /** A specific emotional illustration resolved through the shared registry. */
  name: IllustrationName
  /** Rendered width and height. Values below 32px resolve to the 32px minimum. */
  size?: number
  /** Makes the artwork meaningful content; omit it when the illustration is decorative. */
  label?: string
}

/**
 * Renders hand-drawn category art at Folio's 48px artboard (or a safe scale).
 * It is decorative by default; provide `label` for meaningful empty-state or
 * milestone content, which creates an accessible SVG title.
 */
export function Illustration({
  name,
  size = ILLUSTRATION_ARTBOARD,
  label,
  ...rest
}: IllustrationProps) {
  const titleId = useId()
  const Art = ILLUSTRATION_REGISTRY[name]
  const resolvedSize = Math.max(ILLUSTRATION_MIN_SIZE, size)

  return (
    <svg
      width={resolvedSize}
      height={resolvedSize}
      viewBox={`0 0 ${ILLUSTRATION_ARTBOARD} ${ILLUSTRATION_ARTBOARD}`}
      fill="none"
      stroke="var(--text-secondary)"
      strokeWidth={ILLUSTRATION_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      aria-labelledby={label ? titleId : undefined}
      {...rest}
    >
      {label && <title id={titleId}>{label}</title>}
      <Art />
    </svg>
  )
}
