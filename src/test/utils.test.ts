import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toContain('base-class')
      expect(result).toContain('additional-class')
    })

    it('handles conditional classes', () => {
      const result = cn('base-class', false && 'hidden-class', 'visible-class')
      expect(result).toContain('base-class')
      expect(result).toContain('visible-class')
      expect(result).not.toContain('hidden-class')
    })

    it('handles undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'final-class')
      expect(result).toContain('base-class')
      expect(result).toContain('final-class')
    })
  })
})