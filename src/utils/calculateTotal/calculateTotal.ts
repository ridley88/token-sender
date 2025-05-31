export function calculateTotal(amounts: string): number {
  
  const amountArray = amounts
    .split(/[\n,]+/)
    .map(amount => amount.trim())
    .filter(amount => amount !== '')
    .map(amount => parseFloat(amount))

    return amountArray
        .filter(number => !isNaN(number))
        .reduce((workingTally, entry) => workingTally + entry, 0)
}


