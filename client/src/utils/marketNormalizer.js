/**
 * This is a utility function to normalize the data from the Polymarket API
 * It allows us to transform the data into a more consistent format
 * This is useful for the frontend to display the data in a more consistent way
 * since the data we get from polymarket is not always consistent and
 * arrive in different formats
 */

// We parse the array from the Polymarket API
const parseArray = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (err) {
      return []
    }
  }
  return []
}

// Export the function that will be used
export function normalizePolymarketMarket(market = {}) {
  const outcomes = parseArray(market.outcomes)
  const outcomePrices = parseArray(market.outcomePrices)

  const mergedOutcomes = outcomes.map((label, index) => ({
    label,
    price: outcomePrices[index]
  }))

  // We return the normalized market data
  // This is the data that will be used in the frontend
  return {
    id: market.id || market._id,
    title: market.question || market.title || 'Untitled market',
    endDate: market.endDate || market.endDateIso || null,
    volume: market.volume || market.volume24hr || market.volumeNum || 0,
    outcomes: mergedOutcomes,
    image: market.image || market.icon || ''
  }
}
