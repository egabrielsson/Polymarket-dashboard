import { Api } from '@/Api'
import { normalizePolymarketMarket } from '@/utils/marketNormalizer'

const polymarketCache = {}

export async function loadPolymarketMarket(pmId) {
  if (!pmId) {
    return normalizePolymarketMarket({})
  }

  if (polymarketCache[pmId]) {
    return polymarketCache[pmId]
  }

  try {
    const { data } = await Api.get(`/polymarkets/markets/${pmId}`)
    const normalized = normalizePolymarketMarket(data?.data)
    polymarketCache[pmId] = normalized
    return normalized
  } catch (err) {
    console.warn('Failed to fetch polymarket data', pmId, err)
    const fallback = normalizePolymarketMarket({ id: pmId })
    polymarketCache[pmId] = fallback
    return fallback
  }
}

export async function loadWatchlistMarketDetails(markets = []) {
  if (!markets.length) {
    return []
  }

  const requests = markets.map(async (market) => {
    const details = await loadPolymarketMarket(market.polymarketId)
    return {
      ...market,
      ...details,
      title: market.title || details.title,
      polymarketId: market.polymarketId || details.id
    }
  })

  return Promise.all(requests)
}

export function resetPolymarketCache() {
  Object.keys(polymarketCache).forEach((key) => {
    delete polymarketCache[key]
  })
}
