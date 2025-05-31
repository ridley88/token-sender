import { describe, it, expect } from 'vitest'
import { calculateTotal } from './calculateTotal' // adjust filename as needed

describe('calculateTotal', () => {
  it('sums up numbers separated by newlines', () => {
    const input = '100\n200\n300'
    expect(calculateTotal(input)).toBe(600)
  })

  it('should handle mixed delimiters', () => {
    expect(calculateTotal('100, 200\n300')).toBe(600)
    expect(calculateTotal('1.5\n2.5,3.5')).toBe(7.5)
    expect(calculateTotal('200,,300\n\n400,')).toBe(900)
  })

  it('should handle empty input', () => {
    expect(calculateTotal('')).toBe(0)
    expect(calculateTotal(',\n,     ')).toBe(0)
  })

  it('should handle decimal numbers', () => {
    expect(calculateTotal('1.1\n2.2,3.3')).toBeCloseTo(6.6)
  })

  it('sums up numbers separated by commas', () => {
    const input = '10,20,30'
    expect(calculateTotal(input)).toBe(60)
  })

  it('handles a mix of newlines and commas', () => {
    const input = '1\n2,3\n4,5'
    expect(calculateTotal(input)).toBe(15)
  })

  it('ignores empty strings and extra whitespace', () => {
    const input = ' 100 \n\n , 200 , \n ,300 '
    expect(calculateTotal(input)).toBe(600)
  })

  it('ignores invalid numbers', () => {
    const input = '100,abc,200'
    expect(calculateTotal(input)).toBe(300)
    expect(calculateTotal('12three\n45')).toBe(57)
    expect(calculateTotal('123.45.67')).toBe(123.45)
  })

  it('returns 0 for empty or invalid input', () => {
    expect(calculateTotal('')).toBe(0)
    expect(calculateTotal('abc,xyz')).toBe(0)
  })
})
