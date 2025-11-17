const axios = require("axios");
const cache = require("../utils/cache");

const POLY_BASE =
  process.env.POLY_BASE_URL || "https://gamma-api.polymarket.com";
const POLY_CACHE_TTL = parseInt(process.env.POLY_CACHE_TTL || "60", 10); // seconds

/**
 * Fetch a single market by Polymarket ID
 * @param {string} pmId - Polymarket market ID
 * @returns {object} market data from Polymarket
 */

// Allows us to fetch a single market by Polymarket ID
// using caching to avoid redundant API calls
async function fetchMarketById(pmId) {
  if (!pmId) throw new Error("Market ID is required");

  // We cache the result
  // and avoid redundant API calls by checking cache first
  // And if the data is in cache, return it directly
  const cacheKey = `poly:market:${pmId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  // Try block to fetch market from Polymarket API
  try {
    const url = `${POLY_BASE}/markets/${pmId}`;
    const response = await axios.get(url, { timeout: 5000 });
    const market = response.data;

    // Cache the result that we got
    cache.set(cacheKey, market, POLY_CACHE_TTL);
    return market;
  } catch (err) {
    // Handle specific HTTP errors from Polymarket API
    if (err.response?.status === 404) {
      throw new Error(`Market not found: ${pmId}`);
    }
    if (err.response?.status === 429) {
      throw new Error("Polymarket API rate limited");
    }
    throw new Error(`Failed to fetch market: ${err.message}`);
  }
}

/**
 * Search markets by query (e.g., search term, pagination)
 * @param {string} query - search query or partial market title
 * @param {number} limit - max results per page (default 50)
 * @param {number} offset - pagination offset (default 0)
 * @returns {array} markets matching the query
 */

// Again, we cache the search results
// So when seraching the same query with same pagination,
// we return cached results instead of hitting the API again
async function searchMarkets(query = "", limit = 50, offset = 0) {
  const cacheKey = `poly:search:${query}:${limit}:${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  // Try block to fetch markets from Polymarket API
  try {
    const params = {
      limit: Math.min(limit, 200), // cap at 200
      offset,
      closed: false, // only live markets
    };

    // If query is provided, Polymarket may support search filtering
    // For now, fetch and filter client-side (or check Polymarket's search endpoint)
    if (query) {
      params.search = query; // attempt search param (verify Polymarket API supports this)
    }

    const url = `${POLY_BASE}/markets`;
    const response = await axios.get(url, { params, timeout: 5000 });
    const markets = Array.isArray(response.data) ? response.data : [];

    // Cache the result
    cache.set(cacheKey, markets, POLY_CACHE_TTL);
    return markets;
  } catch (err) {
    if (err.response?.status === 429) {
      throw new Error("Polymarket API rate limited");
    }
    throw new Error(`Failed to search markets: ${err.message}`);
  }
}

/**
 * Fetch only Tech category markets
 * @param {number} limit - max results (default 100)
 * @param {number} offset - pagination offset (default 0)
 * @returns {object} { tag, markets }
 */
async function getTechMarkets(limit = 100, offset = 0) {
  // Use the tag-based approach for Tech markets
  const result = await getMarketsByTag("tech", limit);
  return result;
}

/**
 * Fetch markets by tag/category slug (using tag lookup)
 * @param {string} slug - category slug (e.g., 'tech', 'crypto')
 * @param {number} limit - max results
 * @returns {object} { tag, markets }
 */

async function getMarketsByTag(slug, limit = 100) {
  if (!slug) throw new Error("Tag slug is required");

  const cacheKey = `poly:tag:${slug}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // Step 1: Get tag ID by slug
    const tagUrl = `${POLY_BASE}/tags/slug/${encodeURIComponent(slug)}`;
    const tagResponse = await axios.get(tagUrl, { timeout: 5000 });
    const tag = tagResponse.data;
    // if tag or tag.id is missing, throw error
    if (!tag || !tag.id) {
      throw new Error(`Tag not found for slug: ${slug}`);
    }

    // Step 2: Fetch markets for this tag (with pagination)
    const markets = [];
    let offset = 0;
    const pageSize = Math.min(limit, 100);

    // Loop to fetch markets until we reach the limit set
    while (markets.length < limit) {
      const marketParams = {
        tag_id: tag.id,
        limit: pageSize,
        offset,
        closed: false,
      };
      // Fetch markets for the current page
      const marketUrl = `${POLY_BASE}/markets`;
      const marketResponse = await axios.get(marketUrl, {
        params: marketParams,
        timeout: 5000,
      });
      const page = Array.isArray(marketResponse.data)
        ? marketResponse.data
        : [];

      if (page.length === 0) break;

      markets.push(...page);
      if (page.length < pageSize) break;

      offset += pageSize;
      // Small delay to be polite to API rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const result = { tag, markets: markets.slice(0, limit) };
    cache.set(cacheKey, result, POLY_CACHE_TTL);
    return result;
  } catch (err) {
    if (err.response?.status === 429) {
      throw new Error("Polymarket API rate limited");
    }
    throw new Error(`Failed to fetch markets by tag: ${err.message}`);
  }
}

// Export the functions to be used elsewhere
module.exports = {
  fetchMarketById,
  searchMarkets,
  getMarketsByTag,
  getTechMarkets,
};
