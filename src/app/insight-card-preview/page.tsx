"use client"

import { InsightCard } from '@/components/ui/InsightCard'
import type { InsightCardProps } from '@/components/ui/InsightCard'

const previewCards: readonly InsightCardProps[] = [
  {
    insight: {
      id: 'preview-food-up',
      type: 'category_delta',
      category: 'food',
      direction: 'up',
      magnitude: 18,
      sentence: 'You spent 18% more on Food this week.',
    },
    comparison: { reference: 85, current: 100 },
  },
  {
    insight: {
      id: 'preview-transport-down',
      type: 'category_delta',
      category: 'transport',
      direction: 'down',
      magnitude: 24,
      sentence: 'You spent 24% less on Transportation this week.',
    },
    comparison: { reference: 100, current: 76 },
  },
  {
    insight: {
      id: 'preview-fun-pace',
      type: 'pace',
      category: 'fun',
      direction: 'up',
      magnitude: 45,
      sentence: 'At this pace, Fun could reach $145 by month-end — $45 above your plan.',
    },
    comparison: { reference: 100, current: 145 },
  },
  {
    insight: {
      id: 'preview-drinks-spike',
      type: 'spike',
      category: 'drinks',
      direction: 'up',
      magnitude: 32,
      sentence: 'Your Drinks spending hit $32 on Friday — about 2.6× your usual $12.',
    },
  },
]

/** Review-only route; no application surface links here. */
export default function InsightCardPreviewPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-canvas)', color: 'var(--text)', padding: '48px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
        <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Phase 4.2 review</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--type-screen-title-size)', lineHeight: 'var(--type-screen-title-line-height)', margin: '8px 0 12px' }}>Narrative insight cards</h1>
        <p style={{ color: 'var(--sub)', lineHeight: 1.5, margin: '0 0 28px' }}>Four static examples for visual review. Tap a card to check its press state; this route does not connect to History.</p>

        <div style={{ display: 'grid', gap: 12 }}>
          {previewCards.map((props) => (
            <InsightCard key={props.insight.id} {...props} onPress={() => undefined} />
          ))}
        </div>
      </div>
    </main>
  )
}
