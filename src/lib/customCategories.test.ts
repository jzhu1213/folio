import { describe, expect, it } from 'vitest'
import type { CustomCategory } from '@/types/folio'
import { mergeCategories } from './customCategories'

const category: CustomCategory = {
  id: 'campus-supplies',
  label: 'Campus supplies',
  emoji: '•',
  userId: 'user-1',
  createdAt: '2026-09-13T12:00:00.000Z',
  illustration: 'category:textbooks',
  color: '#f59e0b',
}

describe('mergeCategories', () => {
  it('exposes active custom-category presentation metadata to quick-add', () => {
    const display = mergeCategories([category])
    expect(display).toContainEqual(expect.objectContaining({
      customId: category.id,
      label: 'Campus supplies',
      categoryValue: 'other',
      illustration: 'category:textbooks',
      color: '#f59e0b',
    }))
  })

  it('removes archived custom categories from active quick-add without deleting their records', () => {
    expect(mergeCategories([{ ...category, archived: true }]).some((item) => item.customId === category.id)).toBe(false)
    expect(category.label).toBe('Campus supplies')
  })
})
