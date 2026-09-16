import { render } from '@testing-library/react'
import { configureAxe, toHaveNoViolations } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { InsightCard } from './InsightCard'

expect.extend(toHaveNoViolations)

describe('InsightCard accessibility', () => {
  it('gives the full-card button a sentence and direction label with a minimum touch target', async () => {
    const { container, getByRole } = render(
      <InsightCard
        insight={{
          id: 'food-up',
          type: 'category_delta',
          category: 'food',
          direction: 'up',
          magnitude: 18,
          sentence: 'You spent 18% more on Food this week.',
        }}
        onPress={() => undefined}
      />,
    )

    const button = getByRole('button', {
      name: 'Open insight: You spent 18% more on Food this week. Spending is up.',
    })
    expect(button.style.minHeight).toBe('44px')

    const results = await configureAxe({
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })(container)
    expect(results).toHaveNoViolations()
  })
})
