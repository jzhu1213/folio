import { describe, expect, it } from 'vitest'
import { getPullToRefreshScrollTop } from './PullToRefresh'

describe('getPullToRefreshScrollTop', () => {
  it('uses the wrapper offset when the wrapper is the scrolling surface', () => {
    const container = document.createElement('div')
    Object.defineProperties(container, {
      scrollHeight: { configurable: true, value: 1200 },
      clientHeight: { configurable: true, value: 600 },
      scrollTop: { configurable: true, value: 420 },
    })

    expect(getPullToRefreshScrollTop(container)).toBe(420)
  })

  it('uses document scroll when the wrapper has no scroll range', () => {
    const container = document.createElement('div')
    Object.defineProperties(container, {
      scrollHeight: { configurable: true, value: 600 },
      clientHeight: { configurable: true, value: 600 },
      scrollTop: { configurable: true, value: 0 },
    })
    const previousScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY')
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 640 })

    try {
      expect(getPullToRefreshScrollTop(container)).toBe(640)
    } finally {
      if (previousScrollY) Object.defineProperty(window, 'scrollY', previousScrollY)
    }
  })
})
