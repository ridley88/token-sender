import { describe, it, expect } from 'vitest'
import { formatTokenAmount } from './formatTokenAmount'

describe('formatTokenAmount', () => {
    it('formats with 18 decimals ( standard ERC20) ', () => {
        const result = formatTokenAmount(123000000000000000000, 18)
        expect(result).toBe('1.23')
    })
})