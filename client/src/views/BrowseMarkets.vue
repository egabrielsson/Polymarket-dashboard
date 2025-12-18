<template>
   <b-container fluid class="py-4 browse-markets-view">
    <div
      class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4"
    >
      <div>
        <h1 class="display-6 fw-semibold mb-0">Browse Markets</h1>
        <p class="mb-0">Live markets fetched from Polymarket</p>
      </div>
      <div class="d-flex gap-2">
        <b-button
          variant="outline-primary"
          @click="fetchMarkets"
          :disabled="loading"
          title="Refresh"
        >
          &#8635;
        </b-button>
      </div>
    </div>

    <b-form class="mb-4" @submit.prevent="applySearch">
      <b-row class="g-2 align-items-end">
        <b-col cols="12" md="6" lg="4">
          <b-form-group label="Search" class="mb-0">
            <b-form-input v-model="searchTerm" placeholder="" />
          </b-form-group>
        </b-col>
        <b-col cols="6" md="3" lg="2">
          <b-button
            type="submit"
            variant="primary"
            class="w-100"
            :disabled="loading"
          >
            Apply
          </b-button>
        </b-col>
        <b-col cols="6" md="3" lg="2">
          <b-button
            type="button"
            variant="outline-primary"
            class="w-100"
            @click="clearSearch"
            :disabled="loading"
          >
            Clear
          </b-button>
        </b-col>
      </b-row>
    </b-form>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else-if="markets.length === 0" class="text-center py-5">
      <p class="mb-0">
        <span v-if="activeSearchTerm && activeSearchTerm.trim()">
          No markets found matching "{{ activeSearchTerm }}"
        </span>
        <span v-else>No markets available</span>
      </p>
    </div>
    <div v-else>
      <b-row class="g-4 mb-4">
        <b-col
          v-for="market in markets"
          :key="market._id"
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
                :disabled="addingToWatchlist[market._id] || !activeUserId"
              >
                Add to Watchlist
              </b-button>
            </template>
          </MarketCard>
        </b-col>
      </b-row>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          Page {{ currentPage }} of {{ totalPages }}
          <span v-if="totalMarkets > 0">
            ({{ (currentPage - 1) * marketsPerPage + 1 }}-{{
              Math.min(currentPage * marketsPerPage, totalMarkets)
            }}
            of {{ totalMarkets }})
          </span>
        </div>
        <div class="d-flex gap-2">
          <b-button
            variant="outline-secondary"
            @click="previousPage"
            :disabled="currentPage === 1 || loading"
          >
            Previous
          </b-button>
          <b-button
            variant="primary"
            @click="nextPage"
            :disabled="currentPage >= totalPages || loading"
          >
            Next
          </b-button>
        </div>
      </div>
    </div>
  </b-container>
</template>

<script>
import MarketCard from '@/components/MarketCard.vue'
import { Api } from '@/Api'
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

export default {
  name: 'BrowseMarkets',
  components: {
    MarketCard
  },
  data() {
    return {
      markets: [], // Markets from current query
      loading: false,
      error: '',
      searchTerm: '', // Current input value
      activeSearchTerm: '', // Search term used for backend query
      addingToWatchlist: {},
      currentPage: 1,
      marketsPerPage: 12,
      totalMarkets: 0 // Total count from backend for pagination
    }
  },
  computed: {
    activeUserId() {
      return sessionStore.session.user?.id || null
    },
    totalPages() {
      return Math.ceil(this.totalMarkets / this.marketsPerPage)
    }
  },
  mounted() {
    this.syncAndLoad()
  },
  methods: {
    // Sync fresh data from Polymarket, then load from MongoDB
    async syncAndLoad() {
      this.loading = true
      this.error = ''
      try {
        // Step 1: Sync from Polymarket API to MongoDB
        await Api.get('/polymarkets/tech-markets', { params: { limit: 100 } })
        // Step 2: Load from MongoDB with pagination
        await this.loadFromMongo()
      } catch (err) {
        console.error('Failed to sync markets', err)
        this.error = 'Unable to load markets right now.'
      } finally {
        this.loading = false
      }
    },

    // Load markets from MongoDB with backend filtering, sorting, pagination
    async loadFromMongo() {
      this.loading = true
      this.error = ''
      try {
        const offset = (this.currentPage - 1) * this.marketsPerPage
        const params = {
          limit: this.marketsPerPage,
          offset,
          sort: '-volume' // Sort by volume descending (backend sorting)
        }
        if (this.activeSearchTerm) {
          params.search = this.activeSearchTerm // Backend filtering
        }

        const { data } = await Api.get('/markets', { params })
        this.markets = (data?.data || []).map((m) => ({
          ...m,
          id: m.polymarketId, // For MarketCard compatibility
          title: m.title
        }))
        this.totalMarkets = data?.pagination?.total || 0
      } catch (err) {
        console.error('Failed to load markets from MongoDB', err)
        this.error = 'Unable to load markets right now.'
      } finally {
        this.loading = false
      }
    },

    async fetchMarkets() {
      // Refresh: re-sync from Polymarket and reload
      this.currentPage = 1
      this.activeSearchTerm = ''
      this.searchTerm = ''
      await this.syncAndLoad()
    },

    async addToWatchlist(market) {
      if (!this.activeUserId) {
        this.$router.push({ name: 'login' })
        return
      }

      const marketKey = market.id || market._id
      this.addingToWatchlist[marketKey] = true
      try {
        // POST /markets is idempotent - returns existing or creates new
        const { data: marketData } = await Api.post('/markets', {
          polymarketId: market.id || market.polymarketId
        })
        const marketId = marketData?.data?._id

        await Api.post(`/users/${this.activeUserId}/watchlists`, {
          marketId
        })
      } catch (err) {
        console.error('Failed to add to watchlist', err)
      } finally {
        this.addingToWatchlist[marketKey] = false
      }
    },

    async applySearch() {
      // Backend filtering: query MongoDB with search term
      this.activeSearchTerm = this.searchTerm
      this.currentPage = 1
      await this.loadFromMongo()
    },

    async clearSearch() {
      this.searchTerm = ''
      this.activeSearchTerm = ''
      this.currentPage = 1
      await this.loadFromMongo()
    },

    async nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        await this.loadFromMongo()
      }
    },

    async previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        await this.loadFromMongo()
      }
    }
  }
}
</script>

<style scoped>
@media (max-width: 767.98px) {
  .browse-markets-view {
    padding-top: 45px !important;
  }
}
</style>