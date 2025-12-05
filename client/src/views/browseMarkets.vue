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

    <b-form class="mb-4" @submit.prevent="applySearch">
      <b-row class="g-3">
        <b-col cols="12" md="6" lg="4">
          <b-form-group label="Search">
            <b-form-input
              v-model="searchTerm"
              placeholder="ex - Zuckerberg, AI, Gabagool..."
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
        <b-col cols="12" md="3" lg="2" class="d-flex align-items-end">
          <b-button
            type="button"
            variant="outline-secondary"
            class="w-100"
            @click="clearSearch"
            :disabled="loading"
          >
            Clear
          </b-button>
        </b-col>
      </b-row>
    </b-form>

    <div v-if="loading" class="text-muted">Loading markets…</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else-if="displayedMarkets.length === 0" class="text-center py-5">
      <p class="text-muted mb-0">
        <span v-if="activeSearchTerm && activeSearchTerm.trim()">
          No markets found matching "{{ activeSearchTerm }}"
        </span>
        <span v-else>No markets available</span>
      </p>
    </div>
    <b-row v-else class="g-4">
      <b-col
        v-for="market in displayedMarkets"
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
      allMarkets: [], // All fetched markets
      loading: false,
      error: '',
      searchTerm: '', // Current input value
      activeSearchTerm: '', // Search term used for filtering (only updates on Apply)
      presetLimit: 50 // Preset limit for fetching
    }
  },
  computed: {
    displayedMarkets() {
      // Filter markets based on active search term
      if (!this.activeSearchTerm || !this.activeSearchTerm.trim()) {
        return this.allMarkets
      }
      const searchLower = this.activeSearchTerm.toLowerCase().trim()
      return this.allMarkets.filter((market) => {
        const title = (market.title || '').toLowerCase()
        return title.includes(searchLower)
      })
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
          limit: this.presetLimit
        }
        const { data } = await Api.get('/polymarkets/tech-markets', { params })
        const marketsPayload = data?.data?.markets || []
        this.allMarkets = marketsPayload.map(normalizePolymarketMarket)
      } catch (err) {
        console.error('Failed to load markets', err)
        this.error = 'Unable to load markets right now.'
      } finally {
        this.loading = false
      }
    },
    applySearch() {
      // Apply the search term to active filter
      this.activeSearchTerm = this.searchTerm
    },
    clearSearch() {
      this.searchTerm = ''
      this.activeSearchTerm = ''
    }
  }
}
</script>
