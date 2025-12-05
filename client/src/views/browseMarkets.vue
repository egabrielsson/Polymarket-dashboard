<template>
  <b-container fluid class="py-4">
    <div
      class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4"
    >
      <div>
        <h1 class="display-6 fw-semibold mb-0">Browse Markets</h1>
        <p class="text-muted mb-0">Live markets fetched from Polymarket</p>
      </div>
      <div class="d-flex gap-2">
        <b-button
          variant="outline-secondary"
          @click="$router.push({ name: 'home' })"
        >
          Home
        </b-button>
        <b-button
          variant="outline-primary"
          @click="fetchMarkets"
          :disabled="loading"
        >
          Refresh
        </b-button>
      </div>
    </div>

    <b-form class="mb-4" @submit.prevent="fetchMarkets">
      <b-row class="g-3">
        <b-col cols="12" md="4" lg="3">
          <b-form-group label="Limit">
            <b-form-select
              v-model.number="filters.limit"
              :options="[5, 10, 20, 50]"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="3" lg="2" class="d-flex align-items-end">
          <b-button
            type="submit"
            variant="primary"
            class="w-100"
            :disabled="loading"
          >
            Apply
          </b-button>
        </b-col>
      </b-row>
    </b-form>


    <div v-if="loading" class="text-muted">Loading markets…</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>

    <b-row v-else class="g-4">
      <b-col
        v-for="market in markets"
        :key="market.id"
        cols="12"
        md="6"
        lg="4"
        xl="3"
      >
        <MarketCard :market="market">
          <template #actions>
            <b-button
              variant="primary"
              size="sm"
              class="w-100"
              @click="addToWatchlist(market)"
              :disabled="addingToWatchlist[market.id] || !activeUserId"
            >
              <span
                v-if="addingToWatchlist[market.id]"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Add to Watchlist
            </b-button>
          </template>
        </MarketCard>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import MarketCard from '@/components/MarketCard.vue'
import { Api } from '@/Api'
import { normalizePolymarketMarket } from '@/utils/marketNormalizer'

const DEFAULT_USER_ID = import.meta.env.VITE_TEST_USER_ID || ''

export default {
  name: 'BrowseMarkets',
  components: {
    MarketCard
  },
  data() {
    return {
      markets: [],
      loading: false,
      error: '',
      filters: {
        limit: 12
      },
      activeUserId: DEFAULT_USER_ID,
      addingToWatchlist: {}
    }
  },
  mounted() {
    this.fetchMarkets()
  },
  methods: {
    async fetchMarkets() {
      this.loading = true
      this.error = ''
      try {
        const params = {
          limit: this.filters.limit
        }
        const { data } = await Api.get('/polymarkets/tech-markets', { params })
        const marketsPayload = data?.data?.markets || []
        this.markets = marketsPayload.map(normalizePolymarketMarket)
      } catch (err) {
        console.error('Failed to load markets', err)
        this.error = 'Unable to load markets right now.'
      } finally {
        this.loading = false
      }
    },
    async addToWatchlist(market) {
      if (!this.activeUserId) {
        alert('Please set VITE_TEST_USER_ID in your .env file')
        return
      }

      this.addingToWatchlist[market.id] = true
      try {
        let savedMarketId = null

        // First, try to save the market to database (gets MongoDB _id)
        try {
          const { data: marketData } = await Api.post('/markets', {
            polymarketId: market.id,
            categoryId: null
          })
          savedMarketId = marketData?.data?._id
        } catch (marketErr) {
          // If market already exists (409), fetch it by polymarketId
          if (marketErr?.response?.status === 409) {
            const { data } = await Api.get('/markets')
            const markets = data?.data || []
            const existingMarket = markets.find(
              (m) => m.polymarketId === market.id
            )
            if (existingMarket) {
              savedMarketId = existingMarket._id
            } else {
              throw new Error('Market exists but could not be found')
            }
          } else {
            throw marketErr
          }
        }

        // Then add the saved market to watchlist using MongoDB _id
        await Api.post(`/users/${this.activeUserId}/watchlists`, {
          marketId: savedMarketId
        })
        alert(`Added "${market.title}" to your watchlist!`)
      } catch (err) {
        console.error('Failed to add to watchlist', err)
        alert(
          err?.response?.data?.error || err.message || 'Failed to add to watchlist. Try again.'
        )
      } finally {
        this.addingToWatchlist[market.id] = false
      }
    }
  }
}
</script>
