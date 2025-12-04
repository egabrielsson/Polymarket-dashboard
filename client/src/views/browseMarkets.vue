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
        <MarketCard :market="market" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import MarketCard from '@/components/MarketCard.vue'
import { Api } from '@/Api'
import { normalizePolymarketMarket } from '@/utils/marketNormalizer'

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
      }
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
    }
  }
}
</script>
